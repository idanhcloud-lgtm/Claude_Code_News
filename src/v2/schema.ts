import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { captionSchema } from "../schema";

// Cảnh vẽ tay: ảnh thời sự + nét vẽ (scripts/make-sketch.py) + lời đọc (scripts/make-voiceover.py).
export const sketchShotSchema = z.object({
  image: z.string(),
  // JSON nét vẽ trong public/, tạo bằng scripts/make-sketch.py.
  sketch: z.string(),
  text: z.string(),
  credit: z.string(),
  label: z.string().optional(),
  durationInSeconds: z.number().min(2).max(20),
  narration: z.string().optional(),
  voice: z.string().optional(),
  captions: z.array(captionSchema).optional(),
});

export const sketchStorySchema = z.object({
  showName: z.string(),
  date: z.string(),
  accentColor: zColor(),
  category: z.string(),
  headline: z.string(),
  hookImage: z.string(),
  hookSketch: z.string(),
  hookCredit: z.string(),
  hookLabel: z.string().optional(),
  hookDurationInSeconds: z.number().min(2).max(10).optional(),
  hookNarration: z.string().optional(),
  hookVoice: z.string().optional(),
  shots: z.array(sketchShotSchema).min(1),
  callToAction: z.string(),
  showSafeZone: z.boolean().optional(),
  // Nét vẽ đã tải sẵn trong calculateMetadata (khoá = đường dẫn JSON).
  sketches: z.record(z.string(), z.any()).optional(),
});

export type SketchData = {
  width: number;
  height: number;
  totalLength: number;
  paths: { d: string; length: number }[];
};
export type SketchShot = z.infer<typeof sketchShotSchema>;
export type SketchStoryProps = z.infer<typeof sketchStorySchema>;
