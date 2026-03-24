import { NextRequest, NextResponse } from "next/server";
import {
  toServerErrorMessage,
  updateEmployeeAccount,
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
    const body = (await request.json()) as {
      full_name?: string;
      email?: string;
      phone?: string;
    };

    if (!body.full_name?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: { message: "Missing required employee fields" } },
        { status: 400 },
      );
    }

    const data = await updateEmployeeAccount(
      id,
      {
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
      },
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
