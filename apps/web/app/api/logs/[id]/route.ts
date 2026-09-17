import { NextResponse } from "next/server";
import { deleteLog } from "@/lib/log-store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = await deleteLog(id);

  if (!deleted) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
