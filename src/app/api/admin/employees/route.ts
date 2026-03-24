import { NextRequest, NextResponse } from "next/server";
import {
  createEmployeeAccount,
  toServerErrorMessage,
} from "@/lib/server/admin-employees";

function statusFromError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : "unexpected error";

  if (message.includes("authentication")) return 401;
  if (message.includes("already")) return 409;
  if (message.includes("missing") || message.includes("invalid")) return 400;
  return 500;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      full_name?: string;
      email?: string;
      phone?: string;
      password?: string;
      status?: "active" | "inactive" | "suspended";
      suspended_reason?: string;
    };

    if (
      !body.full_name?.trim() ||
      !body.email?.trim() ||
      !body.password?.trim() ||
      !body.status
    ) {
      return NextResponse.json(
        { error: { message: "Missing required employee fields" } },
        { status: 400 },
      );
    }

    const data = await createEmployeeAccount(
      {
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        status: body.status,
        suspended_reason: body.suspended_reason,
      },
      request.headers,
    );

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: toServerErrorMessage(error) } },
      { status: statusFromError(error) },
    );
  }
}
