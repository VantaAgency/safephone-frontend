import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins/jwt";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
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
        definePayload: async ({ user, session }) => {
          // Look up the SafePhone user record to get org_id and role
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          });
          try {
            const result = await pool.query(
              `SELECT id, org_id, role FROM users WHERE better_auth_id = $1 AND deleted_at IS NULL LIMIT 1`,
              [user.id]
            );
            if (result.rows.length > 0) {
              const sfUser = result.rows[0];
              return {
                sub: sfUser.id,
                org_id: sfUser.org_id,
                email: user.email,
                role: sfUser.role,
                jti: session.id,
              };
            }
            // Fallback if SafePhone user not found yet
            return {
              sub: user.id,
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
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // When a new Better Auth user is created, create the SafePhone
          // organization + user records so the Go backend can find them
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          });
          try {
            const orgName = user.name
              ? `${user.name}'s Organization`
              : "My Organization";
            const slug = `org-${user.id.slice(0, 8)}`;

            // Create organization
            const orgResult = await pool.query(
              `INSERT INTO organizations (id, name, slug, plan, created_at, updated_at)
               VALUES (gen_random_uuid(), $1, $2, 'free', NOW(), NOW())
               RETURNING id`,
              [orgName, slug]
            );
            const orgId = orgResult.rows[0].id;

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
