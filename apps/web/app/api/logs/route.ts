import { NextResponse } from "next/server";
import { MeditationLogInputSchema } from "@meditation-log/shared";
import { createLog, listLogs } from "@/lib/log-store";

export async function GET() {
  const logs = await listLogs();
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = MeditationLogInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid log payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const log = await createLog(parsed.data);
  return NextResponse.json({ log }, { status: 201 });
}
