import { NextRequest, NextResponse } from "next/server";
import {
  toServerErrorMessage,
  updateEmployeeAccountStatus,
} from "@/lib/server/admin-employees";

function statusFromError(error: unknown) {
  const message = toServerErrorMessage(error).toLowerCase();

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  if (message.includes("authentication")) return 401;
  if (message.includes("forbidden") || message.includes("not allowed")) return 403;
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
      status?: "active" | "inactive" | "suspended";
      suspended_reason?: string;
    };

    if (!body.status) {
      return NextResponse.json(
        { error: { message: "Missing employee status" } },
        { status: 400 },
      );
    }

    const data = await updateEmployeeAccountStatus(
      id,
      {
        status: body.status,
        suspended_reason: body.suspended_reason,
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
