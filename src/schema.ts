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

// Mẫu 1 tin dài ~60 giây: mở đầu gây chú ý + nhiều cảnh tư liệu (video/ảnh) có ghi nguồn.
export const shotSchema = z.object({
  // Video (.mp4/.webm/.mov) hoặc ảnh: URL hoặc đường dẫn trong public/ (vd: "media/canh-1.mp4").
  media: z.string(),
  // Ý chính hiển thị trên cảnh (ngắn, 1–2 dòng).
  text: z.string(),
  // Nguồn tư liệu, vd: "VnExpress", "Ảnh: TTXVN".
  credit: z.string(),
  durationInSeconds: z.number().min(2).max(20),
  // Video: bỏ qua N giây đầu; âm lượng tiếng gốc (0 = tắt).
  trimBeforeSeconds: z.number().min(0),
  volume: z.number().min(0).max(1),
  // "frame" cho tư liệu ngang (giữ nguyên khung, nền mờ); "cover" để phủ kín khung dọc.
  fit: z.enum(["frame", "cover"]),
});

export const story60Schema = z.object({
  showName: z.string(),
  date: z.string(),
  accentColor: zColor(),
  category: z.string(),
  headline: z.string(),
  hookMedia: z.string(),
  hookCredit: z.string(),
  hookTrimBeforeSeconds: z.number().min(0),
  hookFit: z.enum(["frame", "cover"]),
  shots: z.array(shotSchema).min(1),
  // Giọng đọc và nhạc nền: đường dẫn trong public/ hoặc URL. Để trống nếu không dùng.
  voiceover: z.string(),
  music: z.string(),
  musicVolume: z.number().min(0).max(1),
  callToAction: z.string(),
  showSafeZone: z.boolean(),
});

export type Shot = z.infer<typeof shotSchema>;
export type Story60Props = z.infer<typeof story60Schema>;
