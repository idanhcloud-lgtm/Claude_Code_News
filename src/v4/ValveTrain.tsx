import { useCurrentFrame, useVideoConfig } from "remotion";
import { blueprint } from "./theme";

// Mô phỏng đầu máy (nhìn mặt cắt): trục cam quay → (cò mổ) → xupáp nhún xuống, lò xo co lại.
// "sohc": 1 trục cam ở giữa, 2 cò mổ đẩy 2 xupáp (kiểu Exciter).
// "dohc": 2 trục cam nằm ngay trên 2 xupáp, đẩy trực tiếp (kiểu Winner X).

type Props = {
  readonly mode: "sohc" | "dohc";
  readonly color: string;
};

const CAM_R = 56;
const LOBE = 34;
const VALVE_TRAVEL = 1.1;

// Độ nâng của vấu cam theo hướng `dir` khi trục quay góc `a` (vấu lệch pha `phase`).
const lobeLift = (a: number, phase: number, dir: number) =>
  LOBE * Math.max(0, Math.cos(dir - (a + phase))) ** 3;

const camPath = (cx: number, cy: number, a: number, phase: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const r = CAM_R + lobeLift(a, phase, t);
    pts.push(
      `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`,
    );
  }
  return `M${pts.join("L")}Z`;
};

// Lò xo xupáp: đường zigzag giữa hai đầu, co lại khi xupáp bị đẩy xuống.
const spring = (x: number, top: number, bottom: number, w: number) => {
  const turns = 7;
  const pts = [`${x} ${top}`];
  for (let i = 1; i < turns * 2; i++) {
    const y = top + ((bottom - top) * i) / (turns * 2);
    pts.push(`${x + (i % 2 ? w : -w)} ${y}`);
  }
  pts.push(`${x} ${bottom}`);
  return `M${pts.join("L")}`;
};

const Valve = ({
  x,
  drop,
  color,
  label,
}: {
  readonly x: number;
  readonly drop: number;
  readonly color: string;
  readonly label: string;
}) => {
  const stemTop = 300 + drop;
  const headY = 560 + drop;
  return (
    <g>
      <path
        d={spring(x, 330 + drop, 470, 26)}
        fill="none"
        stroke={blueprint.muted}
        strokeWidth={4}
      />
      <rect
        x={x - 34}
        y={322 + drop}
        width={68}
        height={10}
        rx={3}
        fill={blueprint.muted}
      />
      <line
        x1={x}
        y1={stemTop}
        x2={x}
        y2={headY}
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={`M${x - 52} ${headY + 16} L${x - 8} ${headY} L${x + 8} ${headY} L${x + 52} ${headY + 16} Z`}
        fill={color}
      />
      <text
        x={x}
        y={650}
        fill={blueprint.muted}
        fontSize={26}
        fontWeight={600}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
};

export const ValveTrain = ({ mode, color }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Quay chậm cho mắt theo kịp: khoảng 0,8 vòng mỗi giây.
  const a = (frame / fps) * Math.PI * 1.6;
  const down = Math.PI / 2;

  if (mode === "dohc") {
    const camL = { x: 290, y: 170 };
    const camR = { x: 610, y: 170 };
    const dropL = lobeLift(a, 0, down) * VALVE_TRAVEL;
    const dropR = lobeLift(a, Math.PI * 0.85, down) * VALVE_TRAVEL;
    return (
      <svg viewBox="0 0 900 700" width={900} height={700}>
        <Head />
        {/* Cốc đẩy (bucket) nằm giữa vấu cam và đuôi xupáp */}
        <rect
          x={camL.x - 40}
          y={232 + dropL}
          width={80}
          height={64}
          rx={8}
          fill="none"
          stroke={blueprint.line}
          strokeWidth={4}
        />
        <rect
          x={camR.x - 40}
          y={232 + dropR}
          width={80}
          height={64}
          rx={8}
          fill="none"
          stroke={blueprint.line}
          strokeWidth={4}
        />
        <Valve x={camL.x} drop={dropL} color={color} label="NẠP" />
        <Valve x={camR.x} drop={dropR} color={color} label="XẢ" />
        <Cam cx={camL.x} cy={camL.y} a={a} phase={0} color={color} />
        <Cam
          cx={camR.x}
          cy={camR.y}
          a={a}
          phase={Math.PI * 0.85}
          color={color}
        />
      </svg>
    );
  }

  // SOHC: trục cam ở giữa, hai cò mổ bập bênh quanh trục riêng.
  const cam = { x: 450, y: 140 };
  const vx = { l: 250, r: 650 };
  const liftL = lobeLift(a, 0, Math.PI * 0.75);
  const liftR = lobeLift(a, Math.PI * 0.85, Math.PI * 0.25);
  const rocker = (side: "l" | "r", lift: number) => {
    const sgn = side === "l" ? -1 : 1;
    const pivot = { x: cam.x + sgn * 130, y: 215 };
    const tilt = (lift / 110) * sgn;
    const rot = (px: number, py: number) => {
      const dx = px - pivot.x;
      const dy = py - pivot.y;
      return {
        x: pivot.x + dx * Math.cos(tilt) - dy * Math.sin(tilt),
        y: pivot.y + dx * Math.sin(tilt) + dy * Math.cos(tilt),
      };
    };
    const camEnd = rot(cam.x + sgn * (CAM_R + 6), 200);
    const valveEnd = rot(side === "l" ? vx.l : vx.r, 286);
    return { pivot, camEnd, valveEnd };
  };
  const L = rocker("l", liftL);
  const R = rocker("r", liftR);
  const dropL = Math.max(0, L.valveEnd.y - 286);
  const dropR = Math.max(0, R.valveEnd.y - 286);

  return (
    <svg viewBox="0 0 900 700" width={900} height={700}>
      <Head />
      <Valve x={vx.l} drop={dropL} color={color} label="NẠP" />
      <Valve x={vx.r} drop={dropR} color={color} label="XẢ" />
      {[L, R].map((r, i) => (
        <g key={i}>
          <line
            x1={r.camEnd.x}
            y1={r.camEnd.y}
            x2={r.valveEnd.x}
            y2={r.valveEnd.y}
            stroke={blueprint.yellow}
            strokeWidth={22}
            strokeLinecap="round"
          />
          <circle
            cx={r.pivot.x}
            cy={r.pivot.y}
            r={14}
            fill={blueprint.bg}
            stroke={blueprint.line}
            strokeWidth={4}
          />
          <circle
            cx={r.camEnd.x}
            cy={r.camEnd.y}
            r={12}
            fill={blueprint.bg}
            stroke={blueprint.yellow}
            strokeWidth={4}
          />
        </g>
      ))}
      <Cam cx={cam.x} cy={cam.y} a={a} phase={0} color={color} />
      <Cam
        cx={cam.x}
        cy={cam.y}
        a={a}
        phase={Math.PI * 0.85}
        color={color}
        ghost
      />
      <text
        x={450}
        y={330}
        fill={blueprint.yellow}
        fontSize={26}
        fontWeight={800}
        textAnchor="middle"
      >
        CÒ MỔ
      </text>
    </svg>
  );
};

const Cam = ({
  cx,
  cy,
  a,
  phase,
  color,
  ghost,
}: {
  readonly cx: number;
  readonly cy: number;
  readonly a: number;
  readonly phase: number;
  readonly color: string;
  readonly ghost?: boolean;
}) => (
  <g opacity={ghost ? 0.55 : 1}>
    <path
      d={camPath(cx, cy, a, phase)}
      fill={ghost ? "none" : `${color}33`}
      stroke={color}
      strokeWidth={5}
    />
    <circle cx={cx} cy={cy} r={12} fill={blueprint.line} />
  </g>
);

// Vách đầu xy-lanh và buồng đốt.
const Head = () => (
  <g fill="none" stroke={blueprint.muted} strokeWidth={4}>
    <path d="M120 600 L120 470 L780 470 L780 600" />
    <path d="M150 600 Q450 520 750 600" strokeDasharray="10 8" />
  </g>
);
