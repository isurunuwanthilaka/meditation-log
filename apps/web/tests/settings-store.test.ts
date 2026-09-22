import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { getSettings, saveSettings } from "../lib/settings-store";

beforeAll(() => {
  delete process.env.POSTGRES_URL;
});

describe("settings-store (in-memory fallback)", () => {
  it("returns defaults for an owner with no saved settings", async () => {
    const settings = await getSettings(randomUUID());
    expect(settings.dailyGoalMinutes).toBe(5);
    expect(settings.reminderEnabled).toBe(true);
    expect(settings.shareEnabled).toBe(true);
    expect(settings.bellEnabled).toBe(true);
  });

  it("saves and returns updated settings scoped to the owner", async () => {
    const ownerId = randomUUID();
    await saveSettings(ownerId, {
      dailyGoalMinutes: 10,
      reminderEnabled: false,
      shareEnabled: true,
      bellEnabled: false,
    });

    const settings = await getSettings(ownerId);
    expect(settings.dailyGoalMinutes).toBe(10);
    expect(settings.reminderEnabled).toBe(false);
    expect(settings.bellEnabled).toBe(false);
  });

  it("does not leak settings between owners", async () => {
    const ownerId = randomUUID();
    const other = randomUUID();
    await saveSettings(ownerId, {
      dailyGoalMinutes: 2,
      reminderEnabled: false,
      shareEnabled: false,
      bellEnabled: false,
    });

    const otherSettings = await getSettings(other);
    expect(otherSettings.dailyGoalMinutes).toBe(5);
  });
});
