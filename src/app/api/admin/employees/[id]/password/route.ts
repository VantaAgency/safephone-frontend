import { NextRequest, NextResponse } from "next/server";
import {
  resetEmployeePassword,
  toServerErrorMessage,
} from "@/lib/server/admin-employees";

function statusFromError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : "unexpected error";

  if (message.includes("authentication")) return 401;
  if (message.includes("not found")) return 404;
  if (message.includes("missing") || message.includes("invalid")) return 400;
  return 500;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { password?: string };

    if (!body.password?.trim() || body.password.trim().length < 8) {
      return NextResponse.json(
        { error: { message: "Password must be at least 8 characters" } },
        { status: 400 },
      );
    }

    const data = await resetEmployeePassword(
      id,
      body.password.trim(),
      request.headers,
    );

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: { message: toServerErrorMessage(error) } },
      { status: statusFromError(error) },
    );
  }
}
