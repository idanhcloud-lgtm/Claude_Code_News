import { useMemo } from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import countries from "./data/countries-sea.json";
import { type Camera, cameraTransform, project } from "./geo";
import type { ExplainerShot } from "./schema";
import {
  CAMERA_MOVE_SECONDS,
  fontFamily,
  MAP_CENTER_Y,
  night,
  SAFE,
} from "./theme";

type MapLayerProps = {
  readonly shots: ExplainerShot[];
  // Khung hình bắt đầu của từng cảnh trên dòng thời gian của cả video.
  readonly starts: number[];
  readonly route?: [number, number][];
};

const lerpCamera = (a: Camera, b: Camera, t: number): Camera => {
  const pa = project(a.lon, a.lat);
  const pb = project(b.lon, b.lat);
  const x = pa.x + (pb.x - pa.x) * t;
  const y = pa.y + (pb.y - pa.y) * t;
  // Đổi ngược toạ độ chiếu về kinh/vĩ độ.
  const lon = (x / 256) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / 256;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lon, lat, zoom: a.zoom + (b.zoom - a.zoom) * t };
};

export const MapLayer = ({ shots, starts, route }: MapLayerProps) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  let i = 0;
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] <= frame) {
      i = s;
    }
  }
  const shot = shots[i];
  const local = frame - starts[i];
  const durationFrames = Math.round(shot.durationInSeconds * fps);

  // Máy quay bay từ vị trí cảnh trước tới vị trí cảnh này.
  const move = interpolate(local, [0, CAMERA_MOVE_SECONDS * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const camera = lerpCamera(
    shots[Math.max(0, i - 1)].camera,
    shot.camera,
    i === 0 ? 1 : move,
  );
  // Đẩy nhẹ (Ken Burns) trong suốt cảnh cho bản đồ không bị đứng.
  camera.zoom += interpolate(local, [0, durationFrames], [0, 0.12]);
  const { k, tx, ty } = cameraTransform(camera, width / 2, MAP_CENTER_Y);
  const toScreen = (lon: number, lat: number) => {
    const p = project(lon, lat);
    return { x: p.x * k + tx, y: p.y * k + ty };
  };

  // Tô màu nước được nhấn mạnh: hiện dần ở đầu cảnh, mờ dần khi cảnh sau không còn nhấn.
  const fadeIn = interpolate(local, [0, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlightOpacity = (iso: string) => {
    const now = shot.highlight?.includes(iso) ?? false;
    const before = i > 0 && (shots[i - 1].highlight?.includes(iso) ?? false);
    if (now && before) return 1;
    if (now) return fadeIn;
    if (before) return 1 - fadeIn;
    return 0;
  };

  // Lộ trình: toạ độ chiếu + độ dài tích luỹ để tìm điểm theo tỷ lệ.
  const routeGeo = useMemo(() => {
    if (!route || route.length < 2) {
      return null;
    }
    const pts = route.map(([lon, lat]) => project(lon, lat));
    const cum = [0];
    for (let p = 1; p < pts.length; p++) {
      cum.push(
        cum[p - 1] +
          Math.hypot(pts[p].x - pts[p - 1].x, pts[p].y - pts[p - 1].y),
      );
    }
    const d = "M" + pts.map((p) => `${p.x} ${p.y}`).join("L");
    return { pts, cum, total: cum[cum.length - 1], d };
  }, [route]);

  let progress = 0;
  for (let s = 0; s <= i; s++) {
    const rp = shots[s].routeProgress;
    if (!rp) continue;
    if (s < i) {
      progress = rp[1];
    } else {
      const dur = Math.round(shots[s].durationInSeconds * fps);
      progress = interpolate(local, [0.4 * fps, dur - 0.3 * fps], rp, {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      });
    }
  }

  let tip: { x: number; y: number } | null = null;
  if (routeGeo && progress > 0) {
    const target = progress * routeGeo.total;
    let seg = 1;
    while (seg < routeGeo.cum.length - 1 && routeGeo.cum[seg] < target) seg++;
    const a = routeGeo.pts[seg - 1];
    const b = routeGeo.pts[seg];
    const segLen = routeGeo.cum[seg] - routeGeo.cum[seg - 1] || 1;
    const t = Math.min(1, (target - routeGeo.cum[seg - 1]) / segLen);
    tip = {
      x: (a.x + (b.x - a.x) * t) * k + tx,
      y: (a.y + (b.y - a.y) * t) * k + ty,
    };
  }

  return (
    <div
      style={{ position: "absolute", inset: 0, backgroundColor: night.ocean }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.65} />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${tx} ${ty}) scale(${k})`}>
          {countries.map((c) => (
            <g key={c.iso}>
              <path
                d={c.d}
                fill={night.land}
                stroke={night.landStroke}
                strokeWidth={1.4 / k}
              />
              <path
                d={c.d}
                fill={night.highlight}
                opacity={highlightOpacity(c.iso)}
              />
            </g>
          ))}
          {routeGeo && progress > 0 ? (
            <path
              d={routeGeo.d}
              fill="none"
              stroke={night.yellow}
              strokeWidth={7 / k}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - progress}
              filter="url(#glow)"
            />
          ) : null}
        </g>
        <rect width="100%" height="100%" fill="url(#vignette)" />
        {tip ? (
          <circle
            cx={tip.x}
            cy={tip.y}
            r={14 + Math.sin(frame / 4) * 3}
            fill={night.yellow}
            filter="url(#glow)"
          />
        ) : null}
      </svg>
      {(shot.markers ?? []).map((m, idx) => {
        const p = toScreen(m.lon, m.lat);
        const pop = spring({
          frame: local - 0.5 * fps - idx * 5,
          fps,
          config: { damping: 14 },
        });
        const main = m.kind !== "minor";
        // Chấm nằm ở nửa phải khung thì đặt nhãn bên trái để không chạm cột nút của TikTok.
        const flip = p.x > width * 0.55;
        const dot = main ? 26 : 16;
        return (
          <div
            key={`${i}-${idx}`}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              display: "flex",
              flexDirection: flip ? "row-reverse" : "row",
              alignItems: "center",
              gap: 14,
              translate: flip
                ? `calc(-100% + ${dot / 2}px) -50%`
                : `-${dot / 2}px -50%`,
              opacity: pop,
              scale: interpolate(pop, [0, 1], [0.4, 1]),
              fontFamily,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: "50%",
                backgroundColor: main ? night.yellow : night.text,
                boxShadow: main
                  ? `0 0 ${18 + Math.sin(frame / 5) * 8}px ${night.yellow}`
                  : "none",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                color: main ? night.text : night.muted,
                fontWeight: 800,
                fontSize: main ? 34 : 28,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                // Nhãn không chạm cột nút bên phải của TikTok.
                maxWidth: flip
                  ? Math.max(120, p.x - SAFE.left - 40)
                  : Math.max(120, width - SAFE.right - p.x - 40),
                overflow: "hidden",
              }}
            >
              {m.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
