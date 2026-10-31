import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Overlay } from "./schema";
import { fontFamily, night, SAFE, STAGE } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const formatNumber = (n: number, decimals: number) =>
  n.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

// Khung chung: nằm giữa thanh tên kênh và phụ đề, chừa cột nút bên phải.
const Stage = ({ children }: { readonly children: React.ReactNode }) => (
  <div
    style={{
      position: "absolute",
      top: STAGE.top,
      left: SAFE.left,
      right: SAFE.right,
      height: STAGE.bottom - STAGE.top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      fontFamily,
      color: night.text,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const Tag = ({
  text,
  delay = 0,
}: {
  readonly text: string;
  readonly delay?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        padding: "10px 22px",
        backgroundColor: night.yellow,
        color: "#111",
        fontWeight: 800,
        fontSize: 36,
        textTransform: "uppercase",
        opacity: pop,
        scale: interpolate(pop, [0, 1], [0.6, 1]),
      }}
    >
      {text}
    </div>
  );
};

const TitleOverlay = ({ o }: { readonly o: Overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0.2 * fps, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <Stage>
      {o.kicker ? <Tag text={o.kicker} /> : null}
      <div
        style={{
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.08,
          textWrap: "balance",
          textShadow: "0 6px 30px rgba(0,0,0,0.85)",
          opacity: enter,
          translate: `0px ${interpolate(enter, [0, 1], [50, 0])}px`,
        }}
      >
        {o.title}
      </div>
    </Stage>
  );
};

const CounterOverlay = ({ o }: { readonly o: Overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [0.3 * fps, 1.6 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pop = spring({ frame, fps, config: { damping: 200 } });
  return (
    <Stage>
      {o.kicker ? <Tag text={o.kicker} /> : null}
      <div
        style={{
          padding: "26px 48px 30px",
          backgroundColor: night.panel,
          borderRadius: 18,
          opacity: pop,
          scale: interpolate(pop, [0, 1], [0.85, 1]),
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 200,
            lineHeight: 1,
            color: night.yellow,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatNumber((o.value ?? 0) * t, o.decimals ?? 0)}
          {/* Đơn vị ngắn (m, tấn) đứng cạnh số; đơn vị dài (tỷ đồng) xuống dòng riêng */}
          {o.suffix && o.suffix.length <= 4 ? (
            <span style={{ fontSize: 80, color: night.text, marginLeft: 16 }}>
              {o.suffix}
            </span>
          ) : null}
        </div>
        {o.suffix && o.suffix.length > 4 ? (
          <div style={{ fontWeight: 800, fontSize: 64, lineHeight: 1.1 }}>
            {o.suffix}
          </div>
        ) : null}
        {o.label ? (
          <div
            style={{
              marginTop: 12,
              fontWeight: 800,
              fontSize: 42,
              textTransform: "uppercase",
            }}
          >
            {o.label}
          </div>
        ) : null}
      </div>
    </Stage>
  );
};

const CalendarOverlay = ({ o }: { readonly o: Overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const flip = spring({
    frame: frame - 0.5 * fps,
    fps,
    config: { damping: 200 },
  });
  const day = o.day ?? 1;
  return (
    <Stage>
      <div
        style={{
          width: 420,
          backgroundColor: "#f6f1e6",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          translate: `0px ${interpolate(drop, [0, 1], [-260, 0])}px`,
          rotate: `${interpolate(drop, [0, 1], [-8, -2])}deg`,
        }}
      >
        <div
          style={{
            backgroundColor: night.highlight,
            color: "#fff",
            fontWeight: 800,
            fontSize: 34,
            padding: "14px 0",
          }}
        >
          {o.month} · {o.year}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 220,
            lineHeight: 1.05,
            color: "#141414",
            scale: `1 ${interpolate(flip, [0, 1], [0, 1])}`,
          }}
        >
          {day}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            paddingBottom: 22,
          }}
        >
          {[day - 1, day, day + 1].map((d) => (
            <div
              key={d}
              style={{
                width: 70,
                padding: "6px 0",
                fontWeight: 800,
                fontSize: 30,
                color: d === day ? "#fff" : "#555",
                backgroundColor: d === day ? "#141414" : "transparent",
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
      {o.label ? <Tag text={o.label} delay={0.7 * fps} /> : null}
    </Stage>
  );
};

const BarsOverlay = ({ o }: { readonly o: Overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = o.items ?? [];
  const max = Math.max(1, ...items.map((it) => it.value ?? 0));
  return (
    <Stage>
      {o.title ? <Tag text={o.title} /> : null}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 36,
          height: 410,
          padding: "30px 36px 0",
          backgroundColor: night.panel,
          borderRadius: 18,
        }}
      >
        {items.map((it, idx) => {
          const grow = interpolate(
            frame,
            [0.3 * fps + idx * 6, 1.4 * fps + idx * 6],
            [0, 1],
            {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            },
          );
          const h = ((it.value ?? 0) / max) * 220 * grow;
          return (
            <div
              key={idx}
              style={{
                width: 190,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 44,
                  color: it.highlight ? night.yellow : night.text,
                }}
              >
                {formatNumber((it.value ?? 0) * grow, 0)}
                {o.unit ? (
                  <span style={{ fontSize: 26 }}> {o.unit}</span>
                ) : null}
              </div>
              <div
                style={{
                  width: "100%",
                  height: h,
                  backgroundColor: it.highlight ? night.yellow : "#e9e4d8",
                }}
              />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 28,
                  minHeight: 80,
                  paddingBottom: 20,
                }}
              >
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const TimelineOverlay = ({ o }: { readonly o: Overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = o.items ?? [];
  const line = interpolate(frame, [0.2 * fps, 1.2 * fps], [0, 100], clamp);
  return (
    <Stage>
      {o.title ? <Tag text={o.title} /> : null}
      <div
        style={{
          position: "relative",
          width: "100%",
          padding: "30px 0",
          display: "flex",
          flexDirection: "column",
          gap: 26,
          backgroundColor: night.panel,
          borderRadius: 18,
        }}
      >
        {/* Trục dọc của dòng thời gian */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 50,
            width: 6,
            height: `calc(${line}% - 80px)`,
            backgroundColor: night.yellow,
          }}
        />
        {items.map((it, idx) => {
          const [time, event] = it.label.split("|");
          const pop = spring({
            frame: frame - 0.4 * fps - idx * 0.35 * fps,
            fps,
            config: { damping: 18 },
          });
          const last = idx === items.length - 1;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                paddingLeft: 56,
                paddingRight: 24,
                opacity: pop,
                translate: `${interpolate(pop, [0, 1], [40, 0])}px 0px`,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  backgroundColor: last ? night.yellow : night.text,
                  border: `6px solid ${night.ocean}`,
                  flexShrink: 0,
                  zIndex: 1,
                }}
              />
              <div>
                <div
                  style={{ fontWeight: 800, fontSize: 34, color: night.yellow }}
                >
                  {time}
                </div>
                <div style={{ fontWeight: 600, fontSize: 38 }}>{event}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const FactsOverlay = ({ o }: { readonly o: Overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      {o.title ? <Tag text={o.title} /> : null}
      {(o.items ?? []).map((it, idx) => {
        const pop = spring({
          frame: frame - 0.3 * fps - idx * 0.4 * fps,
          fps,
          config: { damping: 14 },
        });
        return (
          <div
            key={idx}
            style={{
              padding: "16px 30px",
              backgroundColor: idx % 2 === 0 ? night.text : night.yellow,
              color: "#111",
              fontWeight: 800,
              fontSize: 46,
              boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
              rotate: `${idx % 2 === 0 ? -2 : 2}deg`,
              opacity: pop,
              scale: interpolate(pop, [0, 1], [1.4, 1]),
            }}
          >
            {it.label}
          </div>
        );
      })}
    </Stage>
  );
};

export const OverlayView = ({ overlay }: { readonly overlay: Overlay }) => {
  switch (overlay.type) {
    case "title":
      return <TitleOverlay o={overlay} />;
    case "counter":
      return <CounterOverlay o={overlay} />;
    case "calendar":
      return <CalendarOverlay o={overlay} />;
    case "bars":
      return <BarsOverlay o={overlay} />;
    case "timeline":
      return <TimelineOverlay o={overlay} />;
    case "facts":
      return <FactsOverlay o={overlay} />;
    default:
      return null;
  }
};
