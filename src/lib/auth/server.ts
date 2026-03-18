import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins/jwt";
import { Pool } from "pg";

const DEFAULT_ORG_NAME = "SafePhone";
const DEFAULT_ORG_SLUG = "safephone";

/** Get-or-create the shared SafePhone org. Returns the org UUID. */
async function getSharedOrgId(pool: InstanceType<typeof Pool>): Promise<string> {
  const result = await pool.query(
    `INSERT INTO organizations (id, name, slug, plan, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, 'free', NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [DEFAULT_ORG_NAME, DEFAULT_ORG_SLUG]
  );
  return result.rows[0].id;
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : []),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    nextCookies(),
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
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          });
          try {
            const result = await pool.query(
              `SELECT id FROM users WHERE better_auth_id = $1 AND deleted_at IS NULL LIMIT 1`,
              [user.id]
            );
            if (result.rows.length > 0) {
              return result.rows[0].id;
            }
            // Upsert if missing (pre-hook accounts) — use the shared org
            const orgId = await getSharedOrgId(pool);
            const userResult = await pool.query(
              `INSERT INTO users (id, org_id, email, full_name, role, better_auth_id, created_at, updated_at)
               VALUES (gen_random_uuid(), $1, $2, $3, 'member', $4, NOW(), NOW())
               ON CONFLICT (better_auth_id) DO UPDATE SET updated_at = NOW()
               RETURNING id`,
              [orgId, user.email, user.name || "", user.id]
            );
            return userResult.rows[0].id;
          } finally {
            await pool.end();
          }
        },
        definePayload: async ({ user, session }) => {
          // Look up org_id and role for custom claims (sub is handled by getSubject)
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          });
          try {
            const result = await pool.query(
              `SELECT org_id, role FROM users WHERE better_auth_id = $1 AND deleted_at IS NULL LIMIT 1`,
              [user.id]
            );
            if (result.rows.length > 0) {
              return {
                org_id: result.rows[0].org_id,
                email: user.email,
                role: result.rows[0].role,
                jti: session.id,
              };
            }
            return {
              email: user.email,
              role: "member",
              jti: session.id,
            };
          } finally {
            await pool.end();
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
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          });
          try {
            const result = await pool.query(
              `SELECT role FROM users WHERE better_auth_id = $1 AND deleted_at IS NULL LIMIT 1`,
              [session.userId]
            );
            if (result.rows.length > 0) {
              await pool.query(`UPDATE "user" SET role = $1 WHERE id = $2`, [
                result.rows[0].role,
                session.userId,
              ]);
            }
          } finally {
            await pool.end();
          }
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          // When a new Better Auth user is created, create the SafePhone
          // organization + user records so the Go backend can find them
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          });
          try {
            const orgId = await getSharedOrgId(pool);

            // Create SafePhone user linked to Better Auth user
            await pool.query(
              `INSERT INTO users (id, org_id, email, full_name, phone, role, better_auth_id, created_at, updated_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, 'member', $5, NOW(), NOW())`,
              [
                orgId,
                user.email,
                user.name || "",
                (user as Record<string, unknown>).phone || null,
                user.id,
              ]
            );
          } finally {
            await pool.end();
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
