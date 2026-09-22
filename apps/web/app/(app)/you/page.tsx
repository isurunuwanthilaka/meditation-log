import { getMemberIdentity } from "@/lib/member";
import { YouClient } from "./you-client";

export default async function YouPage() {
  const member = await getMemberIdentity();

  return (
    <YouClient
      memberName={member?.name ?? "Member"}
      initials={member?.initials ?? "?"}
      memberSince={member ? `Sitting with Still Hour since ${member.since}` : "Sitting with Still Hour"}
    />
  );
}
