import { auth } from "@/lib/auth/server";
import { databasePool } from "@/lib/server/db";

export type EmployeeAccountStatus = "active" | "inactive" | "suspended";

export interface CreateEmployeeInput {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  status: EmployeeAccountStatus;
  suspended_reason?: string;
}

export interface UpdateEmployeeInput {
  full_name: string;
  email: string;
  phone?: string;
}

export interface UpdateEmployeeStatusInput {
  status: EmployeeAccountStatus;
  suspended_reason?: string;
}

interface AdminSessionContext {
  betterAuthUserId: string;
  safePhoneUserId: string;
}

interface EmployeeAccountRow {
  id: string;
  better_auth_id: string | null;
  org_id: string;
  status: EmployeeAccountStatus;
}

let betterAuthAdminSchemaEnsured = false;

function authApi() {
  return auth.api as unknown as {
    getSession: (input: { headers: Headers }) => Promise<{
      user?: { id: string; role?: string };
    } | null>;
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
    setUserPassword: (input: {
      headers: Headers;
      body: {
        userId: string;
        newPassword: string;
      };
    }) => Promise<unknown>;
    banUser: (input: {
      headers: Headers;
      body: {
        userId: string;
        banReason?: string;
      };
    }) => Promise<unknown>;
    unbanUser: (input: {
      headers: Headers;
      body: {
        userId: string;
      };
    }) => Promise<unknown>;
  };
}

export async function requireAdminSession(
  requestHeaders: Headers,
): Promise<AdminSessionContext> {
  await ensureBetterAuthAdminSchema();

  const session = await authApi().getSession({ headers: requestHeaders });
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Admin authentication required");
  }

  const result = await databasePool.query(
    `SELECT id
     FROM users
     WHERE better_auth_id = $1
       AND role = 'admin'
       AND deleted_at IS NULL
     LIMIT 1`,
    [session.user.id],
  );

  if (result.rows.length === 0) {
    throw new Error("Admin account not found");
  }

  return {
    betterAuthUserId: session.user.id,
    safePhoneUserId: result.rows[0].id,
  };
}

export async function createEmployeeAccount(
  input: CreateEmployeeInput,
  requestHeaders: Headers,
) {
  await ensureBetterAuthAdminSchema();
  const adminSession = await requireAdminSession(requestHeaders);
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingEmployee = await getEmployeeAccountByEmail(normalizedEmail);
  if (existingEmployee) {
    await upsertEmployeeProfile({
      userId: existingEmployee.id,
      orgId: existingEmployee.org_id,
      status: input.status,
      suspendedReason: input.suspended_reason,
      adminUserId: adminSession.safePhoneUserId,
    });

    return { id: existingEmployee.id };
  }

  let result: { user: { id: string } };
  try {
    result = await authApi().createUser({
      headers: requestHeaders,
      body: {
        email: normalizedEmail,
        password: input.password,
        name: input.full_name.trim(),
        role: "employee",
        data: {
          role: "employee",
          phone: input.phone?.trim() || undefined,
        },
      },
    });
  } catch (error) {
    const alreadyCreatedEmployee = await getEmployeeAccountByEmail(normalizedEmail);
    if (alreadyCreatedEmployee) {
      await upsertEmployeeProfile({
        userId: alreadyCreatedEmployee.id,
        orgId: alreadyCreatedEmployee.org_id,
        status: input.status,
        suspendedReason: input.suspended_reason,
        adminUserId: adminSession.safePhoneUserId,
      });

      return { id: alreadyCreatedEmployee.id };
    }

    throw error;
  }

  const safePhoneUser = await getEmployeeAccountByBetterAuthId(result.user.id);
  if (!safePhoneUser) {
    throw new Error("Employee account sync failed");
  }

  await upsertEmployeeProfile({
    userId: safePhoneUser.id,
    orgId: safePhoneUser.org_id,
    status: input.status,
    suspendedReason: input.suspended_reason,
    adminUserId: adminSession.safePhoneUserId,
  });

  if (input.status === "suspended") {
    await authApi().banUser({
      headers: requestHeaders,
      body: {
        userId: result.user.id,
        banReason:
          input.suspended_reason?.trim() || "Employee account suspended",
      },
    });
  }

  return { id: safePhoneUser.id };
}

export async function updateEmployeeAccount(
  safePhoneUserId: string,
  input: UpdateEmployeeInput,
  requestHeaders: Headers,
) {
  await ensureBetterAuthAdminSchema();
  await requireAdminSession(requestHeaders);

  const employee = await getEmployeeAccountBySafePhoneId(safePhoneUserId);
  if (!employee?.better_auth_id) {
    throw new Error("Employee account not found");
  }

  await authApi().adminUpdateUser({
    headers: requestHeaders,
    body: {
      userId: employee.better_auth_id,
      data: {
        name: input.full_name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
      },
    },
  });

  await databasePool.query(
    `UPDATE users
     SET full_name = $2,
         email = $3,
         phone = $4,
         updated_at = NOW()
     WHERE id = $1
       AND role = 'employee'
       AND deleted_at IS NULL`,
    [
      safePhoneUserId,
      input.full_name.trim(),
      input.email.trim().toLowerCase(),
      input.phone?.trim() || null,
    ],
  );

  return { id: safePhoneUserId };
}

export async function resetEmployeePassword(
  safePhoneUserId: string,
  password: string,
  requestHeaders: Headers,
) {
  await ensureBetterAuthAdminSchema();
  await requireAdminSession(requestHeaders);

  const employee = await getEmployeeAccountBySafePhoneId(safePhoneUserId);
  if (!employee?.better_auth_id) {
    throw new Error("Employee account not found");
  }

  await authApi().setUserPassword({
    headers: requestHeaders,
    body: {
      userId: employee.better_auth_id,
      newPassword: password,
    },
  });

  return { id: safePhoneUserId };
}

export async function updateEmployeeAccountStatus(
  safePhoneUserId: string,
  input: UpdateEmployeeStatusInput,
  requestHeaders: Headers,
) {
  await ensureBetterAuthAdminSchema();
  const adminSession = await requireAdminSession(requestHeaders);

  const employee = await getEmployeeAccountBySafePhoneId(safePhoneUserId);
  if (!employee?.better_auth_id) {
    throw new Error("Employee account not found");
  }

  await upsertEmployeeProfile({
    userId: employee.id,
    orgId: employee.org_id,
    status: input.status,
    suspendedReason: input.suspended_reason,
    adminUserId: adminSession.safePhoneUserId,
  });

  if (input.status === "suspended") {
    await authApi().banUser({
      headers: requestHeaders,
      body: {
        userId: employee.better_auth_id,
        banReason:
          input.suspended_reason?.trim() || "Employee account suspended",
      },
    });
  } else {
    await authApi().unbanUser({
      headers: requestHeaders,
      body: {
        userId: employee.better_auth_id,
      },
    });
  }

  return { id: safePhoneUserId };
}

export function toServerErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "body" in error &&
    error.body &&
    typeof error.body === "object" &&
    "message" in error.body &&
    typeof error.body.message === "string"
  ) {
    return error.body.message;
  }

  return "An unexpected error occurred";
}

async function ensureBetterAuthAdminSchema() {
  if (betterAuthAdminSchemaEnsured) {
    return;
  }

  await databasePool.query(`
    ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "banReason" TEXT,
      ADD COLUMN IF NOT EXISTS "banExpires" TIMESTAMPTZ
  `);

  await databasePool.query(`
    ALTER TABLE "session"
      ADD COLUMN IF NOT EXISTS "impersonatedBy" TEXT
  `);

  betterAuthAdminSchemaEnsured = true;
}

async function getEmployeeAccountByBetterAuthId(betterAuthId: string) {
  const result = await databasePool.query<EmployeeAccountRow>(
    `SELECT
        u.id::text AS id,
        u.better_auth_id,
        u.org_id::text AS org_id,
        COALESCE(ep.status, 'active') AS status
     FROM users u
     LEFT JOIN employee_profiles ep
       ON ep.user_id = u.id
      AND ep.org_id = u.org_id
     WHERE u.better_auth_id = $1
       AND u.role = 'employee'
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [betterAuthId],
  );

  return result.rows[0] ?? null;
}

async function getEmployeeAccountByEmail(email: string) {
  const result = await databasePool.query<EmployeeAccountRow>(
    `SELECT
        u.id::text AS id,
        u.better_auth_id,
        u.org_id::text AS org_id,
        COALESCE(ep.status, 'active') AS status
     FROM users u
     LEFT JOIN employee_profiles ep
       ON ep.user_id = u.id
      AND ep.org_id = u.org_id
     WHERE lower(u.email) = lower($1)
       AND u.role = 'employee'
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

async function getEmployeeAccountBySafePhoneId(safePhoneUserId: string) {
  const result = await databasePool.query<EmployeeAccountRow>(
    `SELECT
        u.id::text AS id,
        u.better_auth_id,
        u.org_id::text AS org_id,
        COALESCE(ep.status, 'active') AS status
     FROM users u
     LEFT JOIN employee_profiles ep
       ON ep.user_id = u.id
      AND ep.org_id = u.org_id
     WHERE u.id = $1::uuid
       AND u.role = 'employee'
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [safePhoneUserId],
  );

  return result.rows[0] ?? null;
}

async function upsertEmployeeProfile({
  userId,
  orgId,
  status,
  suspendedReason,
  adminUserId,
}: {
  userId: string;
  orgId: string;
  status: EmployeeAccountStatus;
  suspendedReason?: string;
  adminUserId: string;
}) {
  await databasePool.query(
    `INSERT INTO employee_profiles (
        user_id,
        org_id,
        status,
        suspended_reason,
        created_by,
        updated_by,
        created_at,
        updated_at
     )
     VALUES ($1::uuid, $2::uuid, $3::varchar(20), CASE WHEN $3::text = 'suspended' THEN $4::text ELSE NULL END, $5::uuid, $5::uuid, NOW(), NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET status = EXCLUDED.status,
         suspended_reason = EXCLUDED.suspended_reason,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()`,
    [
      userId,
      orgId,
      status,
      suspendedReason?.trim() || null,
      adminUserId,
    ],
  );
}
