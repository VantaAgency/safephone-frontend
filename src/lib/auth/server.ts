import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins";
import { jwt } from "better-auth/plugins/jwt";
import { databasePool } from "@/lib/server/db";
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password";
import { getPrimaryRole, normalizeUserRole } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/api/types";

const DEFAULT_ORG_NAME = "SafePhone";
const DEFAULT_ORG_SLUG = "safephone";

/** Get-or-create the shared SafePhone org. Returns the org UUID. */
async function getSharedOrgId(): Promise<string> {
  const pool = databasePool;
  const result = await pool.query(
    `INSERT INTO organizations (id, name, slug, plan, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, 'free', NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [DEFAULT_ORG_NAME, DEFAULT_ORG_SLUG]
  );
  return result.rows[0].id;
}

function readUserRole(user: Record<string, unknown>): UserRole {
  return normalizeUserRole(user.role) ?? "member";
}

async function getEffectiveAuthContext(betterAuthId: string) {
  const result = await databasePool.query(
    `SELECT
       u.id,
       u.org_id,
       u.role,
       (
         SELECT cp.status
         FROM commercial_profiles cp
         WHERE cp.user_id = u.id
           AND cp.org_id = u.org_id
         LIMIT 1
       ) AS commercial_status,
       (
         SELECT ep.status
         FROM employee_profiles ep
         WHERE ep.user_id = u.id
           AND ep.org_id = u.org_id
         LIMIT 1
       ) AS employee_status,
       EXISTS (
         SELECT 1
         FROM commercial_profiles cp
         WHERE cp.user_id = u.id
           AND cp.org_id = u.org_id
           AND cp.status = 'active'
       ) AS has_commercial_role,
       EXISTS (
         SELECT 1
         FROM employee_profiles ep
         WHERE ep.user_id = u.id
           AND ep.org_id = u.org_id
           AND ep.status = 'active'
       ) AS has_employee_role,
       EXISTS (
         SELECT 1
         FROM partners p
         WHERE p.user_id = u.id
           AND p.org_id = u.org_id
           AND p.status = 'active'
       ) AS has_partner_role
     FROM users u
     WHERE u.better_auth_id = $1
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [betterAuthId],
  );

  const row = result.rows[0];
  if (!row) return null;

  const roles: UserRole[] = [];
  const addRole = (role: UserRole | null) => {
    if (role && !roles.includes(role)) {
      roles.push(role);
    }
  };
  const primaryRole = normalizeUserRole(row.role);
  switch (primaryRole) {
    case "commercial":
      if (!row.commercial_status || row.commercial_status === "active") addRole(primaryRole);
      break;
    case "employee":
      if (!row.employee_status || row.employee_status === "active") addRole(primaryRole);
      break;
    default:
      addRole(primaryRole);
  }
  if (row.has_commercial_role && !roles.includes("commercial")) {
    roles.push("commercial");
  }
  if (row.has_employee_role && !roles.includes("employee")) {
    roles.push("employee");
  }
  if (row.has_partner_role && !roles.includes("partner")) {
    roles.push("partner");
  }
  if (roles.length === 0) {
    roles.push("member");
  }

  return {
    id: row.id as string,
    orgId: row.org_id as string,
    role: getPrimaryRole(roles),
    roles,
  };
}

async function ensureEmployeeProfile(userId: string, orgId: string) {
  await databasePool.query(
    `INSERT INTO employee_profiles (user_id, org_id, status, created_at, updated_at)
     VALUES ($1, $2, 'active', NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, orgId],
  );
}

export const auth = betterAuth({
  database: databasePool,
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : []),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        to: user.email,
        resetURL: url,
      });
    },
  },
  plugins: [
    nextCookies(),
    adminPlugin({
      adminRoles: ["admin"],
    }),
    jwt({
      jwks: {
        keyPairConfig: { alg: "ES256" },
      },
      jwt: {
        issuer: "safephone",
        expirationTime: "1h",
        // Better Auth sets `sub` AFTER spreading definePayload, overriding
        // any `sub` we return there. Use getSubject to set the SafePhone UUID.
        getSubject: async ({ user }) => {
          const userPayload = user as Record<string, unknown>;
          try {
            const result = await databasePool.query(
              `SELECT id FROM users WHERE better_auth_id = $1 AND deleted_at IS NULL LIMIT 1`,
              [user.id]
            );
            if (result.rows.length > 0) {
              return result.rows[0].id;
            }
            // Upsert if missing (pre-hook accounts) — use the shared org
            const orgId = await getSharedOrgId();
            const role = readUserRole(userPayload);
            const phone =
              typeof userPayload.phone === "string" ? userPayload.phone : null;
            const userResult = await databasePool.query(
              `INSERT INTO users (id, org_id, email, full_name, role, better_auth_id, created_at, updated_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
               ON CONFLICT (better_auth_id) DO UPDATE
               SET email = EXCLUDED.email,
                   full_name = EXCLUDED.full_name,
                   role = EXCLUDED.role,
                   updated_at = NOW()
               RETURNING id`,
              [orgId, user.email, user.name || "", role, user.id]
            );
            if (phone) {
              await databasePool.query(
                `UPDATE users SET phone = $2, updated_at = NOW() WHERE id = $1`,
                [userResult.rows[0].id, phone],
              );
            }
            if (role === "employee") {
              await ensureEmployeeProfile(userResult.rows[0].id, orgId);
            }
            return userResult.rows[0].id;
          } finally {
          }
        },
        definePayload: async ({ user, session }) => {
          // Look up org_id and all effective roles for custom claims (sub is handled by getSubject).
          try {
            const authContext = await getEffectiveAuthContext(user.id);
            if (authContext) {
              return {
                org_id: authContext.orgId,
                email: user.email,
                role: authContext.role,
                roles: authContext.roles,
                jti: session.id,
              };
            }
            return {
              email: user.email,
              role: "member",
              roles: ["member"],
              jti: session.id,
            };
          } finally {
          }
        },
      },
    }),
  ],

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        // Sync role from SafePhone users table into Better Auth user on every login.
        // This ensures promotions (member → admin/partner) take effect on next sign-in.
        after: async (session) => {
          try {
            const authContext = await getEffectiveAuthContext(session.userId);
            if (authContext) {
              await databasePool.query(`UPDATE "user" SET role = $1 WHERE id = $2`, [
                authContext.role,
                session.userId,
              ]);
            }
          } finally {
          }
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          // When a new Better Auth user is created, create the SafePhone
          // organization + user records so the Go backend can find them
          const userPayload = user as Record<string, unknown>;
          try {
            const orgId = await getSharedOrgId();
            const role = readUserRole(userPayload);
            const phone =
              typeof userPayload.phone === "string" ? userPayload.phone : null;

            // Create SafePhone user linked to Better Auth user
            const result = await databasePool.query(
              `INSERT INTO users (id, org_id, email, full_name, phone, role, better_auth_id, created_at, updated_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
               ON CONFLICT (better_auth_id) DO UPDATE
               SET email = EXCLUDED.email,
                   full_name = EXCLUDED.full_name,
                   phone = EXCLUDED.phone,
                   role = EXCLUDED.role,
                   updated_at = NOW()
               RETURNING id`,
              [
                orgId,
                user.email,
                user.name || "",
                phone,
                role,
                user.id,
              ]
            );
            if (role === "employee") {
              await ensureEmployeeProfile(result.rows[0].id, orgId);
            }
          } finally {
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
