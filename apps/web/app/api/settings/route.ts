import { NextResponse } from "next/server";
import { MemberSettingsInputSchema } from "@meditation-log/shared";
import { getSettings, saveSettings } from "@/lib/settings-store";
import { getRequestOwnerId } from "@/lib/request-owner";

export async function GET(request: Request) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings(ownerId);
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  const current = await getSettings(ownerId);
  const parsed = MemberSettingsInputSchema.safeParse({ ...current, ...(payload as object) });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const settings = await saveSettings(ownerId, parsed.data);
  return NextResponse.json({ settings });
}
