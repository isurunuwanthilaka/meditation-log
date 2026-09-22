import { MeditationLogClient } from "./meditation-log-client";
import type { MeditationLog } from "@meditation-log/shared";

export default async function Home() {
  // The client fetches its own logs (scoped to the current owner) on mount.
  const initialLogs: MeditationLog[] = [];
  return <MeditationLogClient initialLogs={initialLogs} />;
}
