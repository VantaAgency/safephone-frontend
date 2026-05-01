import { NextRequest, NextResponse } from "next/server";
import {
  commercialServerErrorMessage,
  createCommercialAccount,
} from "@/lib/server/admin-commercials";

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
      status?: "active" | "inactive";
      commission_percentage?: number;
    };

    if (
      !body.full_name?.trim() ||
      !body.email?.trim() ||
      !body.password?.trim() ||
      !body.status ||
      typeof body.commission_percentage !== "number"
    ) {
      return NextResponse.json(
        { error: { message: "Missing required commercial fields" } },
        { status: 400 },
      );
    }

    const data = await createCommercialAccount(
      {
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        status: body.status,
        commission_percentage: body.commission_percentage,
      },
      request.headers,
    );

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: commercialServerErrorMessage(error) } },
      { status: statusFromError(error) },
    );
  }
}
