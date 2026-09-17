import { z } from "zod";

export const MeditationLogInputSchema = z.object({
  date: z.string().date(),
  minutes: z.number().int().positive().max(600),
  mood: z.enum(["calm", "focused", "neutral", "stressed", "tired"]),
  notes: z.string().max(1000).optional().default(""),
});

export const MeditationLogSchema = MeditationLogInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type MeditationLogInput = z.infer<typeof MeditationLogInputSchema>;
export type MeditationLog = z.infer<typeof MeditationLogSchema>;

export const MoodOptions: MeditationLogInput["mood"][] = [
  "calm",
  "focused",
  "neutral",
  "stressed",
  "tired",
];
