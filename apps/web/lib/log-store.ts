import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import {
  MeditationLog,
  MeditationLogInput,
  MeditationLogSchema,
} from "@meditation-log/shared";

type MemoryLogEntry = {
  ownerId: string;
  log: MeditationLog;
};

let memoryStore: MemoryLogEntry[] = [];

const hasPostgres = Boolean(process.env.POSTGRES_URL);

async function ensureTable() {
  if (!hasPostgres) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS meditation_logs (
      id UUID PRIMARY KEY,
      owner_id TEXT NOT NULL,
      date DATE NOT NULL,
      minutes INTEGER NOT NULL,
      mood VARCHAR(20) NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );
  `;

  await sql`
    ALTER TABLE meditation_logs
    ADD COLUMN IF NOT EXISTS owner_id TEXT NOT NULL DEFAULT 'legacy';
  `;
}

export async function listLogs(ownerId: string): Promise<MeditationLog[]> {
  if (!hasPostgres) {
    return memoryStore
      .filter((entry) => entry.ownerId === ownerId)
      .map((entry) => entry.log);
  }

  await ensureTable();
  const { rows } = await sql`
    SELECT id, date, minutes, mood, COALESCE(notes, '') AS notes, created_at
    FROM meditation_logs
    WHERE owner_id = ${ownerId}
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

export async function createLog(input: MeditationLogInput, ownerId: string): Promise<MeditationLog> {
  const created = MeditationLogSchema.parse({
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });

  if (!hasPostgres) {
    memoryStore = [{ ownerId, log: created }, ...memoryStore];
    return created;
  }

  await ensureTable();
  await sql`
    INSERT INTO meditation_logs (id, owner_id, date, minutes, mood, notes, created_at)
    VALUES (${created.id}, ${ownerId}, ${created.date}, ${created.minutes}, ${created.mood}, ${created.notes}, ${created.createdAt});
  `;

  return created;
}

export async function deleteLog(id: string, ownerId: string): Promise<boolean> {
  if (!hasPostgres) {
    const lengthBefore = memoryStore.length;
    memoryStore = memoryStore.filter(
      (entry) => !(entry.ownerId === ownerId && entry.log.id === id),
    );
    return memoryStore.length < lengthBefore;
  }

  await ensureTable();
  const result = await sql`
    DELETE FROM meditation_logs WHERE id = ${id} AND owner_id = ${ownerId};
  `;

  return (result.rowCount ?? 0) > 0;
}
