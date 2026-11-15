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
