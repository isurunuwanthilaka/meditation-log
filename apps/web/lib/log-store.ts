import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import {
  MeditationLog,
  MeditationLogInput,
  MeditationLogSchema,
} from "@meditation-log/shared";

let memoryStore: MeditationLog[] = [];

const hasPostgres = Boolean(process.env.POSTGRES_URL);

async function ensureTable() {
  if (!hasPostgres) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS meditation_logs (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      minutes INTEGER NOT NULL,
      mood VARCHAR(20) NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );
  `;
}

export async function listLogs(): Promise<MeditationLog[]> {
  if (!hasPostgres) {
    return memoryStore;
  }

  await ensureTable();
  const { rows } = await sql`
    SELECT id, date, minutes, mood, COALESCE(notes, '') AS notes, created_at
    FROM meditation_logs
    ORDER BY created_at DESC;
  `;

  return rows.map((row) =>
    MeditationLogSchema.parse({
      id: row.id,
      date: new Date(row.date).toISOString().slice(0, 10),
      minutes: row.minutes,
      mood: row.mood,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
    }),
  );
}

export async function createLog(input: MeditationLogInput): Promise<MeditationLog> {
  const created = MeditationLogSchema.parse({
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });

  if (!hasPostgres) {
    memoryStore = [created, ...memoryStore];
    return created;
  }

  await ensureTable();
  await sql`
    INSERT INTO meditation_logs (id, date, minutes, mood, notes, created_at)
    VALUES (${created.id}, ${created.date}, ${created.minutes}, ${created.mood}, ${created.notes}, ${created.createdAt});
  `;

  return created;
}

export async function deleteLog(id: string): Promise<boolean> {
  if (!hasPostgres) {
    const lengthBefore = memoryStore.length;
    memoryStore = memoryStore.filter((log) => log.id !== id);
    return memoryStore.length < lengthBefore;
  }

  await ensureTable();
  const result = await sql`
    DELETE FROM meditation_logs WHERE id = ${id};
  `;

  return (result.rowCount ?? 0) > 0;
}
