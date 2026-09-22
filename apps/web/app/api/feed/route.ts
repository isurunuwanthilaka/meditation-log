import { NextResponse } from "next/server";
import { FeedPostInputSchema } from "@meditation-log/shared";
import { createPost, listPosts } from "@/lib/feed-store";
import { getRequestOwnerId } from "@/lib/request-owner";
import { getMemberIdentity } from "@/lib/member";

export async function GET(request: Request) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await listPosts(ownerId);
  return NextResponse.json({ posts });
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
    return NextResponse.json({ error: "Invalid post payload" }, { status: 400 });
  }

  const parsed = FeedPostInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid post payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const member = await getMemberIdentity();
  const post = await createPost(parsed.data, ownerId, member?.name ?? "You");
  return NextResponse.json({ post }, { status: 201 });
}
