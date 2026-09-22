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

export const DailyGoalOptions = [2, 5, 10] as const;

export const MemberSettingsInputSchema = z.object({
  dailyGoalMinutes: z.union([z.literal(2), z.literal(5), z.literal(10)]).default(5),
  reminderEnabled: z.boolean().default(true),
  shareEnabled: z.boolean().default(true),
  bellEnabled: z.boolean().default(true),
});

export const MemberSettingsSchema = MemberSettingsInputSchema.extend({
  updatedAt: z.string().datetime(),
});

export type MemberSettingsInput = z.infer<typeof MemberSettingsInputSchema>;
export type MemberSettings = z.infer<typeof MemberSettingsSchema>;

export const FeedPostInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  link: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),
});

export const FeedPostSchema = z.object({
  id: z.string().uuid(),
  authorName: z.string(),
  title: z.string(),
  link: z.string(),
  note: z.string(),
  tag: z.string(),
  bows: z.number().int().nonnegative(),
  bowed: z.boolean(),
  createdAt: z.string().datetime(),
});

export type FeedPostInput = z.infer<typeof FeedPostInputSchema>;
export type FeedPost = z.infer<typeof FeedPostSchema>;
