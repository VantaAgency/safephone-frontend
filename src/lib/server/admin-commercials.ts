import { randomBytes } from "crypto";
import { auth } from "@/lib/auth/server";
import { databasePool } from "@/lib/server/db";
import { requireAdminSession } from "@/lib/server/admin-employees";

export type CommercialAccountStatus = "active" | "inactive";

export interface CreateCommercialInput {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  status: CommercialAccountStatus;
  commission_percentage: number;
}

interface CommercialAccountRow {
  id: string;
  better_auth_id: string | null;
  org_id: string;
  role: string;
}

function authApi() {
  return auth.api as unknown as {
    createUser: (input: {
      headers: Headers;
      body: {
        email: string;
        password?: string;
        name: string;
        role?: string;
        data?: Record<string, unknown>;
      };
    }) => Promise<{ user: { id: string } }>;
    adminUpdateUser: (input: {
      headers: Headers;
      body: {
        userId: string;
        data: Record<string, unknown>;
      };
    }) => Promise<unknown>;
  };
}

export async function createCommercialAccount(
  input: CreateCommercialInput,
  requestHeaders: Headers,
) {
  await requireAdminSession(requestHeaders);

  if (!validPercentage(input.commission_percentage)) {
    throw new Error("Invalid commercial commission percentage");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  let account = await getCommercialAccountByEmail(normalizedEmail);

  if (!account) {
    const result = await authApi().createUser({
      headers: requestHeaders,
      body: {
        email: normalizedEmail,
        password: input.password,
        name: input.full_name.trim(),
        role: "commercial",
        data: {
          role: "commercial",
          phone: input.phone?.trim() || undefined,
        },
      },
    });
    account = await getCommercialAccountByBetterAuthId(result.user.id);
  }

  if (!account) {
    throw new Error("Commercial account sync failed");
  }

  if (account.better_auth_id) {
    const updateData: Record<string, unknown> = {
      name: input.full_name.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || null,
    };
    if (shouldUseCommercialAsPrimaryRole(account.role)) {
      updateData.role = "commercial";
    }

    await authApi().adminUpdateUser({
      headers: requestHeaders,
      body: {
        userId: account.better_auth_id,
        data: updateData,
      },
    });
  }

  await databasePool.query(
    `UPDATE users
     SET full_name = $2,
         email = $3,
         phone = $4,
         role = CASE
           WHEN role IN ('member', 'viewer') THEN 'commercial'
           ELSE role
         END,
         updated_at = NOW()
     WHERE id = $1
       AND deleted_at IS NULL`,
    [
      account.id,
      input.full_name.trim(),
      normalizedEmail,
      input.phone?.trim() || null,
    ],
  );

  await upsertCommercialProfile({
    userId: account.id,
    orgId: account.org_id,
    status: input.status,
    commissionPercentage: input.commission_percentage,
  });

  return { id: account.id };
}

async function getCommercialAccountByEmail(email: string): Promise<CommercialAccountRow | null> {
  const result = await databasePool.query(
    `SELECT id, better_auth_id, org_id, role
     FROM users
     WHERE lower(email) = $1
       AND deleted_at IS NULL
     LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

async function getCommercialAccountByBetterAuthId(
  betterAuthId: string,
): Promise<CommercialAccountRow | null> {
  const result = await databasePool.query(
    `SELECT id, better_auth_id, org_id, role
     FROM users
     WHERE better_auth_id = $1
       AND deleted_at IS NULL
     LIMIT 1`,
    [betterAuthId],
  );
  return result.rows[0] ?? null;
}

async function upsertCommercialProfile(input: {
  userId: string;
  orgId: string;
  status: CommercialAccountStatus;
  commissionPercentage: number;
}) {
  const existing = await databasePool.query(
    `SELECT referral_code
     FROM commercial_profiles
     WHERE org_id = $1 AND user_id = $2
     LIMIT 1`,
    [input.orgId, input.userId],
  );
  const referralCode = existing.rows[0]?.referral_code ?? (await uniqueReferralCode());

  await databasePool.query(
    `INSERT INTO commercial_profiles (
       org_id, user_id, referral_code, status, commission_percentage, created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     ON CONFLICT (org_id, user_id) DO UPDATE
     SET status = EXCLUDED.status,
         commission_percentage = EXCLUDED.commission_percentage,
         updated_at = NOW()`,
    [
      input.orgId,
      input.userId,
      referralCode,
      input.status,
      input.commissionPercentage,
    ],
  );
}

async function uniqueReferralCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    const existing = await databasePool.query(
      `SELECT 1 FROM commercial_profiles WHERE referral_code = $1 LIMIT 1`,
      [code],
    );
    if (existing.rows.length === 0) return code;
  }
  throw new Error("Could not generate commercial referral code");
}

function validPercentage(value: number) {
  if (!Number.isFinite(value)) return false;
  if (value <= 0 || value > 100) return false;
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-9;
}

function shouldUseCommercialAsPrimaryRole(role: string) {
  return role === "member" || role === "viewer" || !role;
}

export function commercialServerErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected commercial error";
}
