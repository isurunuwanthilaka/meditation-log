import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { createLog, deleteLog, listLogs } from "../lib/log-store";

beforeAll(() => {
  delete process.env.POSTGRES_URL;
});

describe("log-store (in-memory fallback)", () => {
  it("starts empty for a new owner", async () => {
    const logs = await listLogs(randomUUID());
    expect(logs).toEqual([]);
  });

  it("creates a log and scopes it to the owner", async () => {
    const ownerId = randomUUID();
    const created = await createLog(
      { date: "2026-01-01", minutes: 20, mood: "calm", notes: "" },
      ownerId,
    );

    expect(created.minutes).toBe(20);
    expect(await listLogs(ownerId)).toEqual([created]);
    expect(await listLogs(randomUUID())).toEqual([]);
  });

  it("orders logs most-recent-first", async () => {
    const ownerId = randomUUID();
    const first = await createLog(
      { date: "2026-01-01", minutes: 10, mood: "calm", notes: "" },
      ownerId,
    );
    const second = await createLog(
      { date: "2026-01-02", minutes: 15, mood: "focused", notes: "" },
      ownerId,
    );

    expect(await listLogs(ownerId)).toEqual([second, first]);
  });

  it("deletes a log only for the matching owner", async () => {
    const ownerId = randomUUID();
    const other = randomUUID();
    const created = await createLog(
      { date: "2026-01-01", minutes: 5, mood: "tired", notes: "" },
      ownerId,
    );

    expect(await deleteLog(created.id, other)).toBe(false);
    expect(await deleteLog(created.id, ownerId)).toBe(true);
    expect(await listLogs(ownerId)).toEqual([]);
  });
});
