import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Karaoke } from "./Karaoke";
import { Engine, GearTower, StudioCanvas } from "./Studio3D";
import { fontFamily, SAFE, studio } from "./theme";
import { ENGINE_WORDS } from "./words";

// Video so sánh động cơ, dựng theo giọng đọc của người dùng.
// Không thuộc kênh "TIN NHANH 1 PHÚT": không có thanh tên kênh, ngày hay thanh tiến độ.
export type EngineVideoProps = {
  readonly audio: string;
  readonly exciterImage: string;
  readonly winnerImage: string;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const sec = (s: number, fps: number) => Math.round(s * fps);

// ---------- Máy quay 3D: các mốc (giây, độ phóng, điểm nhìn x, y) ----------
// Điểm nhìn là toạ độ thế giới đưa về giữa vùng hiển thị; độ phóng 1 = toàn cảnh hai khối máy.
const RIG: [number, number, number, number][] = [
  [0, 0.92, 0, 2.0],
  [6.6, 0.92, 0, 2.0],
  [7.6, 2.3, -1.6, 4.0],
  [10.1, 2.3, -1.6, 4.0],
  [10.9, 2.3, 1.6, 3.95],
  [13.4, 2.3, 1.6, 3.95],
  [14.2, 0.92, 0, 2.0],
  [23.4, 0.92, 0, 2.0],
  [24.2, 1.02, 0, 1.6],
  [28.4, 1.02, 0, 1.6],
  [29.0, 0.92, 0, 2.0],
];

const rigAt = (t: number) => {
  let i = 0;
  while (i < RIG.length - 1 && RIG[i + 1][0] <= t) i++;
  const a = RIG[i];
  const b = RIG[Math.min(i + 1, RIG.length - 1)];
  const p =
    b[0] === a[0]
      ? 0
      : interpolate(t, [a[0], b[0]], [0, 1], { ...clamp, easing: ease });
  return {
    k: a[1] + (b[1] - a[1]) * p,
    fx: a[2] + (b[2] - a[2]) * p,
    fy: a[3] + (b[3] - a[3]) * p,
  };
};

// Khối máy hiện trong cảnh động cơ, thu nhỏ biến mất khi chuyển sang hộp số.
const GEARS_FROM = 28.4;
const GEARS_TO = 35.3;

const Stage3D = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = 5.5 + frame / fps;
  const { k, fx, fy } = rigAt(t);
  const theta = (t * Math.PI * 2 * 1.4) % (Math.PI * 400);
  const enginesIn =
    interpolate(t, [GEARS_FROM - 0.1, GEARS_FROM + 0.4], [1, 0], {
      ...clamp,
      easing: ease,
    }) +
    interpolate(t, [GEARS_TO - 0.2, GEARS_TO + 0.3], [0, 1], {
      ...clamp,
      easing: ease,
    });
  const gearsIn = 1 - enginesIn;
  const litEx = Math.floor(interpolate(t, [29.6, 30.4], [0, 5], clamp));
  const litWx = Math.floor(interpolate(t, [30.9, 31.8], [0, 6], clamp));
  const gearAngle = t * Math.PI * 1.2;
  const showStroke = t > 23.6 && t < 28.4;
  // Đưa điểm nhìn (fx, fy) về toạ độ (0, 2.0) và phóng to k lần.
  const C = { x: 0, y: 0.75 };
  return (
    <StudioCanvas width={width} height={height} cameraZ={19} cameraY={1.19}>
      <group
        position={[C.x - fx * k, C.y - fy * k, 0]}
        scale={k}
        rotation={[0.04, -0.22, 0]}
      >
        {enginesIn > 0.01 ? (
          <group scale={enginesIn}>
            <group position={[-1.6, 0, 0]}>
              <Engine
                kind="sohc"
                color={studio.exciter}
                crankR={0.62}
                theta={theta}
                showStroke={showStroke}
              />
            </group>
            <group position={[1.6, 0, 0]}>
              <Engine
                kind="dohc"
                color={studio.winner}
                crankR={0.55}
                theta={theta + 0.6}
                showStroke={showStroke}
              />
            </group>
          </group>
        ) : null}
        {gearsIn > 0.01 ? (
          <group scale={gearsIn * 1.3} position={[0, 0.4, 0]}>
            <group position={[-1.6, -0.9, 0]}>
              <GearTower gears={5} angle={gearAngle} lit={litEx} />
            </group>
            <group position={[1.6, -0.9, 0]}>
              <GearTower gears={6} angle={gearAngle} lit={litWx} />
            </group>
          </group>
        ) : null}
      </group>
    </StudioCanvas>
  );
};

// ---------- Đồ hoạ 2D ----------

const usePop = (delaySec = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delaySec * fps,
    fps,
    config: { damping: 14 },
  });
};

const TitlePill = ({
  title,
  sub,
  color,
}: {
  readonly title: string;
  readonly sub?: string;
  readonly color?: string;
}) => {
  const p = usePop();
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + 10,
        left: SAFE.left,
        right: SAFE.right,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        scale: interpolate(p, [0, 1], [0.8, 1]),
      }}
    >
      <div
        style={{
          padding: "14px 30px",
          borderRadius: 20,
          backgroundColor: color ?? studio.pill,
          color: "#fff",
          fontFamily,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 46 }}>{title}</div>
        {sub ? (
          <div style={{ fontWeight: 600, fontSize: 28, opacity: 0.9 }}>
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Nhãn nhỏ đặt tại toạ độ màn hình (x, y là tâm nhãn).
const Tag = ({
  text,
  color,
  x,
  y,
  delay = 0,
  size = 30,
}: {
  readonly text: string;
  readonly color: string;
  readonly x: number;
  readonly y: number;
  readonly delay?: number;
  readonly size?: number;
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        padding: "8px 20px",
        borderRadius: 999,
        backgroundColor: color,
        border: "3px solid #fff",
        color: "#fff",
        fontFamily,
        fontWeight: 800,
        fontSize: size,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        opacity: p,
        scale: interpolate(p, [0, 1], [0.5, 1]),
      }}
    >
      {text}
    </div>
  );
};

// Vị trí hai khối máy trên màn hình ở góc nhìn toàn cảnh.
const LEFT_X = 330;
const RIGHT_X = 760;

const BrandTags = ({ y = 400 }: { readonly y?: number }) => (
  <>
    <Tag text="EXCITER 150" color={studio.exciter} x={LEFT_X} y={y} />
    <Tag text="WINNER X" color={studio.winner} x={RIGHT_X} y={y} delay={0.15} />
  </>
);

const OutlineText = ({
  text,
  size,
  color,
}: {
  readonly text: string;
  readonly size: number;
  readonly color: string;
}) => (
  <div
    style={{
      fontFamily,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.05,
      color,
      textAlign: "center",
      textWrap: "balance",
      whiteSpace: size < 60 ? "nowrap" : "normal",
      WebkitTextStroke: `${Math.round(size / 9)}px #1c1e22`,
      paintOrder: "stroke fill",
      textShadow: "0 8px 24px rgba(0,0,0,0.25)",
    }}
  >
    {text}
  </div>
);

const Bikes = ({
  exciter,
  winner,
  cta,
}: {
  readonly exciter: string;
  readonly winner: string;
  readonly cta?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 15 } });
  const b = spring({ frame: frame - 0.5 * fps, fps, config: { damping: 15 } });
  const vs = spring({ frame: frame - 0.9 * fps, fps, config: { damping: 9 } });
  const q = spring({
    frame: frame - (cta ? 0.1 : 2.3) * fps,
    fps,
    config: { damping: 12 },
  });
  const opt = (d: number) =>
    spring({ frame: frame - d * fps, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 20,
          left: SAFE.left,
          right: SAFE.right,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {cta ? (
          <div style={{ opacity: q, scale: interpolate(q, [0, 1], [0.6, 1]) }}>
            <OutlineText text="ANH EM PHE NÀO?" size={86} color="#ff4a3d" />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: a,
              }}
            >
              <OutlineText text="EXCITER 150" size={52} color="#fff" />
              <div
                style={{
                  padding: "4px 14px",
                  borderRadius: 10,
                  backgroundColor: "#ff7a2f",
                  color: "#fff",
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 36,
                }}
              >
                VS
              </div>
              <OutlineText text="WINNER X" size={52} color="#fff" />
            </div>
            <div
              style={{ opacity: q, scale: interpolate(q, [0, 1], [0.6, 1]) }}
            >
              <OutlineText
                text="CỤC MÁY NÀO NGON HƠN?"
                size={74}
                color={studio.yellow}
              />
            </div>
          </>
        )}
        {cta ? (
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <div
              style={{
                opacity: opt(1.0),
                scale: interpolate(opt(1.0), [0, 1], [0.5, 1]),
                padding: "10px 24px",
                borderRadius: 14,
                backgroundColor: studio.exciter,
                color: "#fff",
                fontFamily,
                fontWeight: 800,
                fontSize: 40,
                border: "3px solid #fff",
              }}
            >
              1 · EXCITER
            </div>
            <div
              style={{
                opacity: opt(2.3),
                scale: interpolate(opt(2.3), [0, 1], [0.5, 1]),
                padding: "10px 24px",
                borderRadius: 14,
                backgroundColor: studio.winner,
                color: "#fff",
                fontFamily,
                fontWeight: 800,
                fontSize: 40,
                border: "3px solid #fff",
              }}
            >
              2 · WINNER X
            </div>
          </div>
        ) : null}
      </div>
      <Img
        src={staticFile(exciter)}
        style={{
          position: "absolute",
          left: -20,
          top: cta ? 600 : 560,
          width: 820,
          translate: `${interpolate(a, [0, 1], [-900, 0])}px 0px`,
          filter: "drop-shadow(0 30px 30px rgba(0,0,0,0.3))",
        }}
      />
      <Img
        src={staticFile(winner)}
        style={{
          position: "absolute",
          right: 80,
          top: cta ? 1010 : 980,
          width: 760,
          translate: `${interpolate(b, [0, 1], [900, 0])}px 0px`,
          filter: "drop-shadow(0 30px 30px rgba(0,0,0,0.3))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 440,
          top: 960,
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: studio.ink,
          border: "6px solid #fff",
          color: "#fff",
          fontFamily,
          fontWeight: 800,
          fontSize: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: vs,
          scale: interpolate(vs, [0, 1], [0.2, 1]),
        }}
      >
        VS
      </div>
    </AbsoluteFill>
  );
};

// ---------- Ghép video ----------

type Overlay = [number, number, React.ReactNode];

export const EngineVideo = ({
  audio,
  exciterImage,
  winnerImage,
}: EngineVideoProps) => {
  const { fps } = useVideoConfig();
  const overlays: Overlay[] = [
    [0, 5.5, <Bikes key="hook" exciter={exciterImage} winner={winnerImage} />],
    [5.5, 6.6, <BrandTags key="b1" />],
    [5.5, 6.6, <TitlePill key="t0" title="NHÌN LÊN ĐẦU MÁY" />],
    [
      6.6,
      10.1,
      <TitlePill
        key="t1"
        title="EXCITER: SOHC"
        sub="1 trục cam + cò mổ đẩy xupáp"
        color={studio.exciter}
      />,
    ],
    [
      10.1,
      14.0,
      <TitlePill
        key="t2"
        title="WINNER X: DOHC"
        sub="2 trục cam, mỗi cam 1 cặp xupáp"
        color={studio.winner}
      />,
    ],
    [
      14.0,
      23.4,
      <TitlePill
        key="t3"
        title="CÔNG SUẤT CỰC ĐẠI"
        sub="xupáp đóng mở chính xác hơn ở tua cao"
      />,
    ],
    [14.4, 23.4, <BrandTags key="b2" />],
    [
      18.9,
      23.4,
      <Tag
        key="p1"
        text="9.000 vòng/phút"
        color={studio.winner}
        x={RIGHT_X}
        y={1170}
      />,
    ],
    [
      20.5,
      23.4,
      <Tag
        key="p2"
        text="8.500 vòng/phút"
        color={studio.exciter}
        x={LEFT_X}
        y={1170}
      />,
    ],
    [
      23.4,
      28.4,
      <TitlePill
        key="t4"
        title="HÀNH TRÌNH PISTON"
        sub="Exciter dài hơn → mô-men xoắn nhỉnh hơn"
      />,
    ],
    [24.2, 28.4, <BrandTags key="b3" y={430} />],
    [
      26.5,
      28.4,
      <Tag
        key="p3"
        text="13,8 Nm"
        color={studio.exciter}
        x={LEFT_X}
        y={1180}
        size={36}
      />,
    ],
    [
      27.7,
      28.4,
      <Tag
        key="p4"
        text="13,5 Nm"
        color={studio.winner}
        x={RIGHT_X}
        y={1180}
        size={36}
      />,
    ],
    [
      28.4,
      35.3,
      <TitlePill
        key="t5"
        title="HỘP SỐ"
        sub="số 6 chạy đường dài êm, giữ tua thấp"
      />,
    ],
    [
      29.6,
      35.3,
      <Tag
        key="g1"
        text="EXCITER · 5 SỐ"
        color={studio.exciter}
        x={LEFT_X}
        y={440}
      />,
    ],
    [
      30.9,
      35.3,
      <Tag
        key="g2"
        text="WINNER X · 6 SỐ"
        color={studio.winner}
        x={RIGHT_X}
        y={440}
      />,
    ],
    [35.3, 39.0, <TitlePill key="t6" title="TÓM LẠI" />],
    [
      36.1,
      39.0,
      <Tag
        key="s1"
        text="EXCITER: KÉO LÌ"
        color={studio.exciter}
        x={LEFT_X}
        y={430}
        size={34}
      />,
    ],
    [
      37.4,
      39.0,
      <Tag
        key="s2"
        text="WINNER X: ÔM TUA CAO"
        color={studio.winner}
        x={RIGHT_X - 30}
        y={500}
        size={34}
      />,
    ],
    [
      39.0,
      42.7,
      <Bikes key="cta" exciter={exciterImage} winner={winnerImage} cta />,
    ],
  ];
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${studio.skyTop} 0%, ${studio.skyMid} 38%, #e2e8ee 54%, ${studio.floor} 55%, #f7f8fa 100%)`,
      }}
    >
      <Sequence
        name="Khối máy 3D"
        from={sec(5.5, fps)}
        durationInFrames={sec(39.0 - 5.5, fps)}
      >
        <Stage3D />
      </Sequence>
      {overlays.map(([from, to, node], i) => (
        <Sequence
          key={i}
          from={sec(from, fps)}
          durationInFrames={sec(to - from, fps)}
          layout="none"
        >
          {node}
        </Sequence>
      ))}
      <Karaoke words={ENGINE_WORDS} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
