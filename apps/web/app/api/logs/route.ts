import { NextResponse } from "next/server";
import { MeditationLogInputSchema } from "@meditation-log/shared";
import { createLog, listLogs } from "@/lib/log-store";
import { getRequestOwnerId } from "@/lib/request-owner";

export async function GET(request: Request) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await listLogs(ownerId);
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid log payload" }, { status: 400 });
  }

  const parsed = MeditationLogInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid log payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const log = await createLog(parsed.data, ownerId);
  return NextResponse.json({ log }, { status: 201 });
}
