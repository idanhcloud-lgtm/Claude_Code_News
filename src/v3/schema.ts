import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { captionSchema } from "../schema";

const lonLat = z.tuple([z.number(), z.number()]);

export const cameraSchema = z.object({
  lon: z.number(),
  lat: z.number(),
  // 6 ≈ cả Việt Nam, 9 ≈ cấp tỉnh, 11–12 ≈ cấp quận.
  zoom: z.number().min(2).max(14),
});

export const markerSchema = z.object({
  lon: z.number(),
  lat: z.number(),
  label: z.string(),
  // "main" = chấm vàng phát sáng, "minor" = chấm trắng nhỏ.
  kind: z.enum(["main", "minor"]).optional(),
});

// Đồ hoạ số liệu đặt trên bản đồ. Mỗi loại dùng một số trường:
// title: kicker, title · counter: value, suffix, label, decimals · calendar: day, month, year, label
// bars: title, unit, items[label, value, highlight] · timeline: title, items[label, value] · facts: items[label]
export const overlaySchema = z.object({
  type: z.enum(["title", "counter", "calendar", "bars", "timeline", "facts"]),
  kicker: z.string().optional(),
  title: z.string().optional(),
  value: z.number().optional(),
  decimals: z.number().optional(),
  suffix: z.string().optional(),
  label: z.string().optional(),
  unit: z.string().optional(),
  day: z.number().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().optional(),
        highlight: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const explainerShotSchema = z.object({
  durationInSeconds: z.number().min(2).max(20),
  camera: cameraSchema,
  highlight: z.array(z.string()).optional(),
  markers: z.array(markerSchema).optional(),
  // Phần lộ trình được vẽ trong cảnh này, từ 0 (điểm đầu) tới 1 (điểm cuối).
  routeProgress: z.tuple([z.number(), z.number()]).optional(),
  overlay: overlaySchema.optional(),
  narration: z.string().optional(),
  voice: z.string().optional(),
  captions: z.array(captionSchema).optional(),
});

export const explainerSchema = z.object({
  showName: z.string(),
  date: z.string(),
  accentColor: zColor(),
  // Lộ trình (kinh độ, vĩ độ) vẽ thành đường vàng, vd đường đi của tàu, đường bay.
  route: z.array(lonLat).optional(),
  routeNote: z.string().optional(),
  credit: z.string(),
  shots: z.array(explainerShotSchema).min(1),
  callToAction: z.string(),
  showSafeZone: z.boolean().optional(),
});

export type ExplainerShot = z.infer<typeof explainerShotSchema>;
export type ExplainerProps = z.infer<typeof explainerSchema>;
export type Overlay = z.infer<typeof overlaySchema>;
