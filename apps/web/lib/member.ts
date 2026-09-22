import { createClient } from "@/lib/supabase/server";

export type MemberIdentity = {
  name: string;
  initials: string;
  since: string;
};

function deriveName(user: { email?: string | null; user_metadata?: Record<string, unknown> }): string {
  const metaName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }

  if (user.email) {
    const local = user.email.split("@")[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  return "Member";
}

function initialsOf(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "?";
}

export async function getMemberIdentity(): Promise<MemberIdentity | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const name = deriveName(user);
  const createdAt = user.created_at ? new Date(user.created_at) : new Date();
  const since = createdAt.toLocaleString("en-US", { month: "long", year: "numeric" });

  return { name, initials: initialsOf(name), since };
}
