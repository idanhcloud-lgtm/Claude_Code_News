import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const storySchema = z.object({
  category: z.string(),
  headline: z.string(),
  summary: z.string(),
  // URL ảnh hoặc tên file trong thư mục public/ (vd: "tin-1.jpg"). Để trống = nền động.
  image: z.string(),
  source: z.string(),
  durationInSeconds: z.number().min(2).max(60),
});

export const newsSchema = z.object({
  showName: z.string(),
  date: z.string(),
  accentColor: zColor(),
  tickerLabel: z.string(),
  ticker: z.array(z.string()),
  callToAction: z.string(),
  // Hiện vùng bị giao diện TikTok che (chỉ trong Studio, không có trong file render).
  showSafeZone: z.boolean(),
  stories: z.array(storySchema).min(1),
});

export type Story = z.infer<typeof storySchema>;
export type NewsProps = z.infer<typeof newsSchema>;
