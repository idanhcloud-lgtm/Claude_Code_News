import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "../elements/Captions";
import { ProgressBar } from "../elements/ProgressBar";
import { ENGINE_CAPTIONS } from "./captions";
import { GearIndicator, PistonCylinder, Tachometer } from "./Instruments";
import { blueprint, fontFamily, SAFE, STAGE } from "./theme";
import { Dohc3D, Pistons3D, Sohc3D } from "./Engine3D";
import { ValveTrain } from "./ValveTrain";

// Video này không thuộc kênh "TIN NHANH 1 PHÚT": không có thanh tên kênh và ngày.
export type EngineVideoProps = {
  readonly audio: string;
  // true: 3 cảnh cơ khí (1 trục cam, 2 trục cam, piston) dựng bằng mô hình 3D.
  readonly mode3d?: boolean;
};

const STAGE_W = 856;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Khung cảnh: hiện dần ở đầu, mờ dần ở cuối.
const Scene = ({ children }: { readonly children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 6, durationInFrames - 6, durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );
  return (
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
        justifyContent: "flex-start",
        gap: 20,
        fontFamily,
        color: blueprint.line,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

const Chip = ({
  text,
  color,
}: {
  readonly text: string;
  readonly color: string;
}) => (
  <div
    style={{
      padding: "10px 24px",
      backgroundColor: color,
      color: "#fff",
      fontWeight: 800,
      fontSize: 38,
      textTransform: "uppercase",
      textAlign: "center",
    }}
  >
    {text}
  </div>
);

const Note = ({ text }: { readonly text: string }) => (
  <div style={{ fontWeight: 600, fontSize: 26, color: blueprint.muted }}>
    {text}
  </div>
);

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 14 } });
  const b = spring({ frame: frame - 0.5 * fps, fps, config: { damping: 14 } });
  const vs = spring({ frame: frame - 1 * fps, fps, config: { damping: 10 } });
  const open = interpolate(frame, [3.4 * fps, 4.4 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const name = (text: string, color: string, p: number, from: number) => (
    <div
      style={{
        width: "100%",
        padding: "26px 0",
        backgroundColor: color,
        color: "#fff",
        fontWeight: 800,
        fontSize: 104,
        textAlign: "center",
        translate: `${interpolate(p, [0, 1], [from, 0])}px 0px`,
        opacity: p,
      }}
    >
      {text}
    </div>
  );
  return (
    <Scene>
      <div style={{ height: 40 }} />
      {name("EXCITER 150", blueprint.exciter, a, -900)}
      <div
        style={{
          fontWeight: 800,
          fontSize: 96,
          color: blueprint.yellow,
          scale: interpolate(vs, [0, 1], [0.3, 1]),
          opacity: vs,
        }}
      >
        VS
      </div>
      {name("WINNER X", blueprint.winner, b, 900)}
      <div
        style={{
          marginTop: 30,
          fontWeight: 800,
          fontSize: 64,
          color: blueprint.yellow,
          opacity: open,
          scale: interpolate(open, [0, 1], [1.4, 1]),
        }}
      >
        MỔ MÁY RA XEM!
      </div>
    </Scene>
  );
};

const Sohc = ({ is3d }: { readonly is3d: boolean }) => (
  <Scene>
    <Chip text="Exciter · 1 trục cam" color={blueprint.exciter} />
    <Note
      text={
        is3d
          ? "Mô hình minh hoạ · cò mổ màu vàng"
          : "Đầu máy nhìn mặt cắt · 4 xupáp (hình vẽ 1 cặp)"
      }
    />
    {is3d ? (
      <Sohc3D color={blueprint.exciter} width={STAGE_W} height={700} />
    ) : (
      <div style={{ scale: 0.95 }}>
        <ValveTrain mode="sohc" color={blueprint.exciter} />
      </div>
    )}
  </Scene>
);

const Dohc = ({ is3d }: { readonly is3d: boolean }) => (
  <Scene>
    <Chip text="Winner X · 2 trục cam" color={blueprint.winner} />
    <Note text="Mỗi trục cam lo riêng 1 cặp xupáp" />
    {is3d ? (
      <Dohc3D color={blueprint.winner} width={STAGE_W} height={700} />
    ) : (
      <div style={{ scale: 0.95 }}>
        <ValveTrain mode="dohc" color={blueprint.winner} />
      </div>
    )}
  </Scene>
);

const Gauges = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const winner = interpolate(frame, [0.4 * fps, 4.9 * fps], [0, 9000], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const exciter = interpolate(frame, [5.8 * fps, 7.0 * fps], [0, 8500], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <Scene>
      <Chip text="Công suất cực đại ở vòng tua" color="#2a3a55" />
      <Tachometer
        rpm={winner}
        color={blueprint.winner}
        name="WINNER X"
        size={330}
      />
      <Tachometer
        rpm={exciter}
        color={blueprint.exciter}
        name="EXCITER 150"
        size={330}
      />
    </Scene>
  );
};

const Pistons = ({ is3d }: { readonly is3d: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const torque = interpolate(frame, [1.9 * fps, 3.2 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const bar = (v: number, color: string) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 52, color }}>
        {(v * torque).toFixed(1).replace(".", ",")} Nm
      </div>
      <div
        style={{
          width: 120,
          height: 14,
          backgroundColor: color,
          scale: `${torque} 1`,
        }}
      />
    </div>
  );
  return (
    <Scene>
      <Chip text="Hành trình piston (minh hoạ)" color="#2a3a55" />
      {is3d ? (
        <div style={{ position: "relative" }}>
          <Pistons3D width={STAGE_W} height={600} />
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <Chip text="Exciter 150" color={blueprint.exciter} />
            <Chip text="Winner X" color={blueprint.winner} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 80, marginTop: -40 }}>
          <PistonCylinder
            color={blueprint.exciter}
            name="EXCITER 150"
            crankR={78}
          />
          <PistonCylinder
            color={blueprint.winner}
            name="WINNER X"
            crankR={66}
          />
        </div>
      )}
      <div style={{ display: "flex", gap: 120, opacity: torque }}>
        {bar(13.8, blueprint.exciter)}
        {bar(13.5, blueprint.winner)}
      </div>
    </Scene>
  );
};

const Gears = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = (max: number) =>
    Math.min(
      max,
      1 + Math.floor(interpolate(frame, [0.2 * fps, 3.0 * fps], [0, 6], clamp)),
    );
  const six = frame > 3.7 * fps;
  const tip = interpolate(frame, [3.7 * fps, 4.3 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return (
    <Scene>
      <Chip text="Hộp số" color="#2a3a55" />
      <div style={{ height: 30 }} />
      <GearIndicator
        gears={5}
        current={g(5)}
        color={blueprint.exciter}
        name="EXCITER 150 · 5 SỐ"
      />
      <div style={{ height: 40 }} />
      <GearIndicator
        gears={6}
        current={g(6)}
        color={blueprint.winner}
        name="WINNER X · 6 SỐ"
        highlightSix={six}
      />
      <div
        style={{
          marginTop: 40,
          padding: "16px 28px",
          backgroundColor: blueprint.yellow,
          color: "#111",
          fontWeight: 800,
          fontSize: 40,
          textAlign: "center",
          opacity: tip,
          translate: `0px ${interpolate(tip, [0, 1], [30, 0])}px`,
        }}
      >
        Số 6: đi đường dài êm hơn, tua thấp hơn
      </div>
    </Scene>
  );
};

const Summary = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = (title: string, line: string, color: string, delay: number) => {
    const p = spring({ frame: frame - delay, fps, config: { damping: 14 } });
    return (
      <div
        style={{
          width: "100%",
          padding: "36px 20px",
          borderRadius: 20,
          border: `6px solid ${color}`,
          backgroundColor: blueprint.panel,
          textAlign: "center",
          opacity: p,
          scale: interpolate(p, [0, 1], [0.8, 1]),
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 52, color }}>{title}</div>
        <div style={{ fontWeight: 800, fontSize: 92, color: blueprint.line }}>
          {line}
        </div>
      </div>
    );
  };
  return (
    <Scene>
      <Chip text="Tóm lại" color="#2a3a55" />
      <div style={{ height: 20 }} />
      {card("EXCITER 150", "KÉO LÌ", blueprint.exciter, 0.6 * fps)}
      {card("WINNER X", "ÔM TUA CAO", blueprint.winner, 1.9 * fps)}
    </Scene>
  );
};

const Cta = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 1 + Math.sin((frame / fps) * Math.PI * 3) * 0.04;
  const btn = (n: string, label: string, color: string, delay: number) => {
    const p = spring({ frame: frame - delay, fps, config: { damping: 12 } });
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30,
          width: "100%",
          padding: "26px 34px",
          borderRadius: 24,
          backgroundColor: color,
          opacity: p,
          scale: interpolate(p, [0, 1], [0.6, 1]) * pulse,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#fff",
            color,
            fontWeight: 800,
            fontSize: 84,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
        <div style={{ fontWeight: 800, fontSize: 64, color: "#fff" }}>
          {label}
        </div>
      </div>
    );
  };
  return (
    <Scene>
      <div
        style={{
          fontWeight: 800,
          fontSize: 76,
          color: blueprint.yellow,
          marginTop: 40,
        }}
      >
        ANH EM PHE NÀO?
      </div>
      <div style={{ fontWeight: 600, fontSize: 40, color: blueprint.muted }}>
        Bình luận ngay 👇
      </div>
      <div style={{ height: 30 }} />
      {btn("1", "EXCITER 150", blueprint.exciter, 1.0 * fps)}
      {btn("2", "WINNER X", blueprint.winner, 2.3 * fps)}
    </Scene>
  );
};

// Mốc cảnh theo giọng đọc (giây).
const SCENES: [number, number, (is3d: boolean) => React.ReactNode][] = [
  [0, 5.5, () => <Hook />],
  [5.5, 10.1, (is3d) => <Sohc is3d={is3d} />],
  [10.1, 14.0, (is3d) => <Dohc is3d={is3d} />],
  [14.0, 23.4, () => <Gauges />],
  [23.4, 28.4, (is3d) => <Pistons is3d={is3d} />],
  [28.4, 35.3, () => <Gears />],
  [35.3, 39.0, () => <Summary />],
  [39.0, 42.7, () => <Cta />],
];

export const EngineVideo = ({ audio, mode3d }: EngineVideoProps) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: blueprint.bg }}>
      {/* Lưới bản vẽ kỹ thuật */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${blueprint.grid} 2px, transparent 2px), linear-gradient(90deg, ${blueprint.grid} 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {SCENES.map(([from, to, render], i) => (
        <Sequence
          key={i}
          name={`Cảnh ${i + 1}`}
          from={Math.round(from * fps)}
          durationInFrames={Math.round((to - from) * fps)}
        >
          {render(mode3d ?? false)}
        </Sequence>
      ))}
      <ProgressBar name="Tiến độ" accentColor={blueprint.yellow} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.right,
          bottom: SAFE.bottom + 30,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Captions
          captions={ENGINE_CAPTIONS}
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 50,
            lineHeight: 1.2,
            color: "#fff",
            textAlign: "center",
            textWrap: "balance",
            textShadow: "0 3px 14px rgba(0,0,0,0.95)",
          }}
        />
      </div>
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
