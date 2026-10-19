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

// Phụ đề theo kiểu Caption của @remotion/captions (thời gian tính từ đầu cảnh).
export const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  timestampMs: z.number().nullable(),
  confidence: z.number().nullable(),
});

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
  // Cắt mép dưới khung "frame" (0–0.4), vd giấu phụ đề in sẵn trong video nguồn.
  cutBottom: z.number().min(0).max(0.4).optional(),
  // Giữ phần nào khi ảnh/video bị cắt: 0 = trên, 0.5 = giữa (mặc định), 1 = dưới.
  focusY: z.number().min(0).max(1).optional(),
  // Lời đọc của cảnh. scripts/make-voiceover.py đọc trường này, tạo file giọng (voice),
  // phụ đề (captions) và tự đặt durationInSeconds theo độ dài giọng đọc.
  narration: z.string().optional(),
  voice: z.string().optional(),
  captions: z.array(captionSchema).optional(),
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
  hookCutBottom: z.number().min(0).max(0.4).optional(),
  hookFocusY: z.number().min(0).max(1).optional(),
  // Mặc định 3 giây; make-voiceover.py đặt theo độ dài lời đọc của hook.
  hookDurationInSeconds: z.number().min(2).max(10).optional(),
  hookNarration: z.string().optional(),
  hookVoice: z.string().optional(),
  shots: z.array(shotSchema).min(1),
  // Giọng đọc và nhạc nền: đường dẫn trong public/ hoặc URL. Để trống nếu không dùng.
  voiceover: z.string(),
  music: z.string(),
  musicVolume: z.number().min(0).max(1),
  callToAction: z.string(),
  showSafeZone: z.boolean(),
});

export type Shot = z.infer<typeof shotSchema>;
export type CaptionData = z.infer<typeof captionSchema>;
export type Story60Props = z.infer<typeof story60Schema>;
