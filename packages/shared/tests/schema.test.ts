import { describe, expect, it } from "vitest";
import { MeditationLogInputSchema } from "../src/index";

describe("MeditationLogInputSchema", () => {
  it("accepts valid payload", () => {
    const parsed = MeditationLogInputSchema.parse({
      date: "2026-01-01",
      minutes: 20,
      mood: "calm",
      notes: "morning session",
    });

    expect(parsed.minutes).toBe(20);
  });

  it("rejects invalid minutes", () => {
    const parsed = MeditationLogInputSchema.safeParse({
      date: "2026-01-01",
      minutes: 0,
      mood: "calm",
    });

    expect(parsed.success).toBe(false);
  });
});
