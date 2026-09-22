import { sql } from "@vercel/postgres";
import {
  MemberSettings,
  MemberSettingsInput,
  MemberSettingsInputSchema,
  MemberSettingsSchema,
} from "@meditation-log/shared";

type MemorySettingsEntry = {
  ownerId: string;
  settings: MemberSettings;
};

let memoryStore: MemorySettingsEntry[] = [];

const hasPostgres = Boolean(process.env.POSTGRES_URL);

const defaultSettings: MemberSettingsInput = MemberSettingsInputSchema.parse({});

async function ensureTable() {
  if (!hasPostgres) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS member_settings (
      owner_id TEXT PRIMARY KEY,
      daily_goal_minutes INTEGER NOT NULL,
      reminder_enabled BOOLEAN NOT NULL,
      share_enabled BOOLEAN NOT NULL,
      bell_enabled BOOLEAN NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `;
}

export async function getSettings(ownerId: string): Promise<MemberSettings> {
  if (!hasPostgres) {
    const found = memoryStore.find((entry) => entry.ownerId === ownerId);
    return (
      found?.settings ??
      MemberSettingsSchema.parse({ ...defaultSettings, updatedAt: new Date().toISOString() })
    );
  }

  await ensureTable();
  const { rows } = await sql`
    SELECT daily_goal_minutes, reminder_enabled, share_enabled, bell_enabled, updated_at
    FROM member_settings
    WHERE owner_id = ${ownerId};
  `;

  if (rows.length === 0) {
    return MemberSettingsSchema.parse({ ...defaultSettings, updatedAt: new Date().toISOString() });
  }

  const row = rows[0];
  return MemberSettingsSchema.parse({
    dailyGoalMinutes: row.daily_goal_minutes,
    reminderEnabled: row.reminder_enabled,
    shareEnabled: row.share_enabled,
    bellEnabled: row.bell_enabled,
    updatedAt: new Date(row.updated_at).toISOString(),
  });
}

export async function saveSettings(
  ownerId: string,
  input: MemberSettingsInput,
): Promise<MemberSettings> {
  const settings = MemberSettingsSchema.parse({ ...input, updatedAt: new Date().toISOString() });

  if (!hasPostgres) {
    memoryStore = [
      { ownerId, settings },
      ...memoryStore.filter((entry) => entry.ownerId !== ownerId),
    ];
    return settings;
  }

  await ensureTable();
  await sql`
    INSERT INTO member_settings (owner_id, daily_goal_minutes, reminder_enabled, share_enabled, bell_enabled, updated_at)
    VALUES (${ownerId}, ${settings.dailyGoalMinutes}, ${settings.reminderEnabled}, ${settings.shareEnabled}, ${settings.bellEnabled}, ${settings.updatedAt})
    ON CONFLICT (owner_id) DO UPDATE SET
      daily_goal_minutes = EXCLUDED.daily_goal_minutes,
      reminder_enabled = EXCLUDED.reminder_enabled,
      share_enabled = EXCLUDED.share_enabled,
      bell_enabled = EXCLUDED.bell_enabled,
      updated_at = EXCLUDED.updated_at;
  `;

  return settings;
}
