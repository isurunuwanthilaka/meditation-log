import { z } from "zod";

const OwnerIdSchema = z.string().uuid();

export function getRequestOwnerId(request: Request): string | null {
  const ownerId = request.headers.get("x-owner-id");
  const parsed = OwnerIdSchema.safeParse(ownerId);
  return parsed.success ? parsed.data : null;
}
