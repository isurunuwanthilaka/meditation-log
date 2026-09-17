import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLog } from "@/lib/log-store";
import { getRequestOwnerId } from "@/lib/request-owner";

const LogIdSchema = z.string().uuid();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = LogIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid log id" }, { status: 400 });
  }

  const deleted = await deleteLog(parsedId.data, ownerId);

  if (!deleted) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
