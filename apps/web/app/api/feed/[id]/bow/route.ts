import { NextResponse } from "next/server";
import { z } from "zod";
import { toggleBow } from "@/lib/feed-store";
import { getRequestOwnerId } from "@/lib/request-owner";

const PostIdSchema = z.string().uuid();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ownerId = getRequestOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = PostIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const post = await toggleBow(parsedId.data, ownerId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}
