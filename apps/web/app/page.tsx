import { MeditationLogClient } from "./meditation-log-client";
import { listLogs } from "@/lib/log-store";

export default async function Home() {
  const logs = await listLogs();
  return <MeditationLogClient initialLogs={logs} />;
}
