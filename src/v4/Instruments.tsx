import { useCurrentFrame, useVideoConfig } from "remotion";
import { blueprint, fontFamily } from "./theme";

// Đồng hồ vòng tua 0–12 (×1000 vòng/phút), vạch đỏ từ 10.
export const Tachometer = ({
  rpm,
  color,
  name,
  size = 420,
}: {
  readonly rpm: number;
  readonly color: string;
  readonly name: string;
  readonly size?: number;
}) => {
  const max = 12000;
  const start = Math.PI * 0.75;
  const sweep = Math.PI * 1.5;
  const ang = (v: number) => start + (Math.min(v, max) / max) * sweep;
  const c = 200;
  const R = 170;
  const pt = (v: number, r: number) => ({
    x: c + r * Math.cos(ang(v)),
    y: c + r * Math.sin(ang(v)),
  });
  const arc = (from: number, to: number, r: number) => {
    const p0 = pt(from, r);
    const p1 = pt(to, r);
    const large = ang(to) - ang(from) > Math.PI ? 1 : 0;
    return `M${p0.x} ${p0.y} A${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };
  const needle = pt(rpm, 150);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily,
      }}
    >
      <svg viewBox="0 0 400 400" width={size} height={size}>
        <circle
          cx={c}
          cy={c}
          r={190}
          fill={blueprint.panel}
          stroke={`${color}66`}
          strokeWidth={4}
        />
        <path
          d={arc(0, max, R)}
          fill="none"
          stroke={blueprint.muted}
          strokeWidth={6}
        />
        <path
          d={arc(10000, max, R)}
          fill="none"
          stroke={blueprint.winner}
          strokeWidth={14}
        />
        <path d={arc(0, rpm, R)} fill="none" stroke={color} strokeWidth={14} />
        {Array.from({ length: 13 }, (_, i) => {
          const a = pt(i * 1000, R - 12);
          const b = pt(i * 1000, R - 34);
          const t = pt(i * 1000, R - 60);
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={blueprint.line}
                strokeWidth={4}
              />
              <text
                x={t.x}
                y={t.y + 9}
                fill={blueprint.line}
                fontSize={26}
                fontWeight={700}
                textAnchor="middle"
              >
                {i}
              </text>
            </g>
          );
        })}
        <line
          x1={c}
          y1={c}
          x2={needle.x}
          y2={needle.y}
          stroke={blueprint.yellow}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <circle cx={c} cy={c} r={18} fill={blueprint.yellow} />
        <text
          x={c}
          y={c + 92}
          fill={blueprint.line}
          fontSize={58}
          fontWeight={800}
          textAnchor="middle"
        >
          {(Math.round(rpm / 50) * 50).toLocaleString("vi-VN")}
        </text>
        <text
          x={c}
          y={c + 128}
          fill={blueprint.muted}
          fontSize={22}
          fontWeight={600}
          textAnchor="middle"
        >
          vòng/phút
        </text>
      </svg>
      <div
        style={{
          marginTop: -12,
          padding: "6px 22px",
          backgroundColor: color,
          color: "#fff",
          fontWeight: 800,
          fontSize: 36,
        }}
      >
        {name}
      </div>
    </div>
  );
};

// Piston + tay biên + trục khuỷu. crankR lớn hơn = hành trình dài hơn (hành trình = 2 × crankR).
export const PistonCylinder = ({
  color,
  name,
  crankR,
}: {
  readonly color: string;
  readonly name: string;
  readonly crankR: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theta = (frame / fps) * Math.PI * 2 * 0.9;
  const rod = 190;
  const cx = 150;
  const cy = 560;
  const pinX = cx + crankR * Math.sin(theta);
  const pinY = cy - crankR * Math.cos(theta);
  const pistonY =
    cy -
    (crankR * Math.cos(theta) +
      Math.sqrt(rod * rod - (crankR * Math.sin(theta)) ** 2));
  const tdc = cy - (crankR + rod);
  const bdc = cy - (rod - crankR);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily,
      }}
    >
      <svg viewBox="0 0 300 700" width={240} height={560}>
        {/* Thành xy-lanh */}
        <path
          d={`M60 120 L60 ${bdc + 60} M240 120 L240 ${bdc + 60}`}
          stroke={blueprint.line}
          strokeWidth={5}
        />
        {/* Mốc điểm chết trên / dưới và hành trình */}
        <line
          x1={20}
          y1={tdc - 40}
          x2={280}
          y2={tdc - 40}
          stroke={blueprint.yellow}
          strokeWidth={3}
          strokeDasharray="8 6"
        />
        <line
          x1={20}
          y1={bdc - 40}
          x2={280}
          y2={bdc - 40}
          stroke={blueprint.yellow}
          strokeWidth={3}
          strokeDasharray="8 6"
        />
        <line
          x1={275}
          y1={tdc - 40}
          x2={275}
          y2={bdc - 40}
          stroke={blueprint.yellow}
          strokeWidth={5}
        />
        {/* Piston */}
        <rect
          x={66}
          y={pistonY - 80}
          width={168}
          height={90}
          rx={8}
          fill={`${color}55`}
          stroke={color}
          strokeWidth={5}
        />
        <line
          x1={66}
          y1={pistonY - 66}
          x2={234}
          y2={pistonY - 66}
          stroke={color}
          strokeWidth={3}
        />
        <line
          x1={66}
          y1={pistonY - 54}
          x2={234}
          y2={pistonY - 54}
          stroke={color}
          strokeWidth={3}
        />
        {/* Tay biên và trục khuỷu */}
        <line
          x1={cx}
          y1={pistonY - 30}
          x2={pinX}
          y2={pinY}
          stroke={blueprint.line}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={crankR + 26}
          fill="none"
          stroke={blueprint.muted}
          strokeWidth={4}
        />
        <circle cx={pinX} cy={pinY} r={14} fill={blueprint.yellow} />
        <circle cx={cx} cy={cy} r={10} fill={blueprint.line} />
      </svg>
      <div
        style={{
          padding: "6px 22px",
          backgroundColor: color,
          color: "#fff",
          fontWeight: 800,
          fontSize: 34,
        }}
      >
        {name}
      </div>
    </div>
  );
};

// Đèn báo số: các ô 1..6, số hiện tại sáng màu; xe chỉ có 5 số thì ô 6 bị gạch.
export const GearIndicator = ({
  gears,
  current,
  color,
  name,
  highlightSix,
}: {
  readonly gears: number;
  readonly current: number;
  readonly color: string;
  readonly name: string;
  readonly highlightSix?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      fontFamily,
    }}
  >
    <div
      style={{
        padding: "6px 22px",
        backgroundColor: color,
        color: "#fff",
        fontWeight: 800,
        fontSize: 36,
      }}
    >
      {name}
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      {[1, 2, 3, 4, 5, 6].map((g) => {
        const exists = g <= gears;
        const on = exists && g <= current;
        return (
          <div
            key={g}
            style={{
              width: 112,
              height: 132,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 72,
              color: exists
                ? on
                  ? "#fff"
                  : blueprint.muted
                : "rgba(143,163,196,0.25)",
              backgroundColor: on ? color : blueprint.panel,
              border: `4px solid ${g === 6 && highlightSix && exists ? blueprint.yellow : exists ? `${color}88` : "rgba(143,163,196,0.2)"}`,
              textDecoration: exists ? "none" : "line-through",
              boxShadow: g === current && on ? `0 0 30px ${color}` : "none",
            }}
          >
            {g}
          </div>
        );
      })}
    </div>
  </div>
);
