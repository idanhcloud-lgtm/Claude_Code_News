import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import * as THREE from "three";

// Khối máy 3D cắt đôi (nhìn được bên trong) + tháp bánh răng hộp số, đặt trong phông studio sáng.
// Mọi chuyển động nhận góc quay từ ngoài vào (tính từ useCurrentFrame ở cảnh), không dùng useFrame.

export const METAL = "#b9c2cc";
const METAL_DARK = "#8a939e";
const CAST = "#9aa3ad";
const MIX = "#39d36b";
const FIRE = "#ff8a3d";

const metal = { metalness: 0.75, roughness: 0.32 } as const;

// ---------- Hình học dùng lại ----------

const useCamGeometry = (r: number, lobe: number, depth: number) =>
  useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      const rr = r + lobe * Math.max(0, Math.cos(t)) ** 3;
      if (i === 0) shape.moveTo(rr * Math.cos(t), rr * Math.sin(t));
      else shape.lineTo(rr * Math.cos(t), rr * Math.sin(t));
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [r, lobe, depth]);

const useSpringGeometry = () =>
  useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 6;
    for (let i = 0; i <= turns * 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          0.13 * Math.cos(t),
          i / (turns * 24),
          0.13 * Math.sin(t),
        ),
      );
    }
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts),
      300,
      0.02,
      6,
      false,
    );
  }, []);

const useGearGeometry = (r: number, teeth: number, thick: number) =>
  useMemo(() => {
    const shape = new THREE.Shape();
    const steps = teeth * 4;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const tooth = i % 4 === 1 || i % 4 === 2;
      const rr = tooth ? r : r - 0.08;
      if (i === 0) shape.moveTo(rr * Math.cos(t), rr * Math.sin(t));
      else shape.lineTo(rr * Math.cos(t), rr * Math.sin(t));
    }
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.07, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: thick,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 1,
    });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [r, teeth, thick]);

// Nửa sau của một hình trụ (để thấy bên trong): mở về phía máy quay.
const HalfShell = ({
  r,
  h,
  y,
  color,
  opacity = 1,
}: {
  readonly r: number;
  readonly h: number;
  readonly y: number;
  readonly color: string;
  readonly opacity?: number;
}) => (
  <mesh position={[0, y, 0]} castShadow receiveShadow>
    <cylinderGeometry args={[r, r, h, 48, 1, true, Math.PI / 2, Math.PI]} />
    <meshStandardMaterial
      color={color}
      side={THREE.DoubleSide}
      transparent={opacity < 1}
      opacity={opacity}
      {...metal}
    />
  </mesh>
);

// ---------- Xupáp nghiêng (buồng đốt mái) ----------

const Valve = ({
  tipX,
  tipY,
  tilt,
  drop,
  color,
}: {
  readonly tipX: number;
  readonly tipY: number;
  readonly tilt: number;
  readonly drop: number;
  readonly color: string;
}) => {
  const spring = useSpringGeometry();
  return (
    <group position={[tipX, tipY, 0]} rotation={[0, 0, tilt]}>
      <group position={[0, -drop, 0]}>
        <mesh position={[0, -0.55, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.1, 12]} />
          <meshStandardMaterial color={METAL} {...metal} />
        </mesh>
        <mesh position={[0, -1.12, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.2, 0.08, 24]} />
          <meshStandardMaterial color={color} {...metal} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 24]} />
          <meshStandardMaterial color={METAL} {...metal} />
        </mesh>
      </group>
      {/* Lò xo: đáy cố định, đỉnh đi theo đĩa chặn */}
      <mesh
        geometry={spring}
        position={[0, -0.62, 0]}
        scale={[1, 0.55 - drop, 1]}
      >
        <meshStandardMaterial color={METAL_DARK} {...metal} />
      </mesh>
    </group>
  );
};

// ---------- Khối máy ----------

export type EngineProps = {
  readonly kind: "sohc" | "dohc";
  readonly color: string;
  // Bán kính tay quay: hành trình = 2 × crankR.
  readonly crankR: number;
  // Góc trục khuỷu (radian). Trục cam quay bằng một nửa (động cơ 4 kỳ).
  readonly theta: number;
  readonly showStroke?: boolean;
};

const ROD = 1.9;

const lobeLift = (a: number, phase: number, dir: number, lobe: number) =>
  lobe * Math.max(0, Math.cos(dir - (a + phase))) ** 3;

export const Engine = ({
  kind,
  color,
  crankR,
  theta,
  showStroke,
}: EngineProps) => {
  const pinX = crankR * Math.sin(theta);
  const pinY = crankR * Math.cos(theta);
  const pistonPinY =
    crankR * Math.cos(theta) +
    Math.sqrt(ROD * ROD - (crankR * Math.sin(theta)) ** 2);
  const rodAngle = Math.atan2(pistonPinY - pinY, -pinX) - Math.PI / 2;
  const headBottom = crankR + ROD + 0.55;
  const pistonTop = pistonPinY + 0.3;
  // Kỳ nổ: piston gần điểm chết trên ở vòng quay chẵn → khí nạp xanh bùng màu cam.
  const cycle = ((theta % (Math.PI * 4)) + Math.PI * 4) % (Math.PI * 4);
  const firing = Math.max(0, Math.cos(cycle - Math.PI * 2 - 0.35)) ** 6;
  const mixColor = new THREE.Color(MIX).lerp(new THREE.Color(FIRE), firing);
  const camA = theta / 2;
  const cylH = headBottom - 0.9;
  const finCount = Math.floor(cylH / 0.2);

  // Đầu máy: vị trí trục cam, xupáp.
  // Đuôi xupáp; nấm xupáp nằm ở trần buồng đốt (đầu xupáp chụm về giữa).
  const valveTipY = headBottom + 1.07;
  const valveTilt = 0.42;
  const tipX = 0.62;
  const lobe = 0.13;
  let dropIn = 0;
  let dropEx = 0;
  let rockers: { pivotX: number; tilt: number; side: number }[] = [];
  let cams: { x: number; phase: number }[] = [];
  // SOHC: trục cam nằm giữa hai thân xupáp, cò mổ ngang tầm đuôi xupáp.
  const camY = valveTipY - 0.26;
  if (kind === "dohc") {
    cams = [
      { x: -tipX, phase: 0 },
      { x: tipX, phase: Math.PI * 0.9 },
    ];
    dropIn = lobeLift(camA, 0, -Math.PI / 2, lobe) * 0.9;
    dropEx = lobeLift(camA, Math.PI * 0.9, -Math.PI / 2, lobe) * 0.9;
  } else {
    cams = [{ x: 0, phase: 0 }];
    const lIn = lobeLift(camA, 0, Math.PI / 2 + 0.2, lobe);
    const lEx = lobeLift(camA, Math.PI * 0.9, Math.PI / 2 - 0.2, lobe);
    const tIn = lIn / 0.28;
    const tEx = lEx / 0.28;
    rockers = [
      { pivotX: -0.36, tilt: tIn, side: -1 },
      { pivotX: 0.36, tilt: -tEx, side: 1 },
    ];
    dropIn = 0.42 * Math.sin(tIn);
    dropEx = 0.42 * Math.sin(tEx);
  }

  return (
    <group>
      {/* Hộp trục khuỷu (nửa sau) */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry
            args={[crankR + 0.75, crankR + 0.75, 1.3, 48, 1, true, 0, Math.PI]}
          />
          <meshStandardMaterial
            color={CAST}
            side={THREE.DoubleSide}
            {...metal}
          />
        </mesh>
      </group>
      {/* Trục khuỷu: má khuỷu + chốt */}
      {[-0.28, 0.28].map((z) => (
        <mesh
          key={z}
          position={[0, 0, z]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[crankR + 0.32, crankR + 0.32, 0.12, 40]} />
          <meshStandardMaterial color={METAL} {...metal} />
        </mesh>
      ))}
      <mesh position={[pinX, pinY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.6, 20]} />
        <meshStandardMaterial color={METAL_DARK} {...metal} />
      </mesh>
      {/* Tay biên */}
      <mesh
        position={[pinX / 2, (pinY + pistonPinY) / 2, 0]}
        rotation={[0, 0, rodAngle]}
        castShadow
      >
        <boxGeometry args={[0.17, ROD, 0.16]} />
        <meshStandardMaterial color={METAL} {...metal} />
      </mesh>
      {/* Piston */}
      <mesh position={[0, pistonPinY + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.5, 40]} />
        <meshStandardMaterial color={METAL} {...metal} />
      </mesh>
      {[0.12, 0.2].map((dy) => (
        <mesh key={dy} position={[0, pistonPinY + dy, 0]}>
          <torusGeometry args={[0.62, 0.012, 6, 40]} />
          <meshStandardMaterial color={METAL_DARK} {...metal} />
        </mesh>
      ))}
      {/* Khí nạp trong buồng đốt */}
      <mesh position={[0, (pistonTop + headBottom) / 2, 0]}>
        <cylinderGeometry
          args={[0.6, 0.6, Math.max(0.02, headBottom - pistonTop), 40]}
        />
        <meshStandardMaterial
          color={mixColor}
          emissive={mixColor}
          emissiveIntensity={0.35 + firing * 1.4}
          transparent
          opacity={0.72}
          roughness={0.5}
        />
      </mesh>
      {/* Xy-lanh + cánh tản nhiệt (nửa sau) */}
      <HalfShell r={0.68} h={cylH} y={0.9 + cylH / 2} color={CAST} />
      {Array.from({ length: finCount }, (_, i) => (
        <HalfShell key={i} r={1.2} h={0.06} y={1.0 + i * 0.2} color={CAST} />
      ))}
      {/* Đầu máy */}
      <HalfShell r={1.25} h={1.8} y={headBottom + 0.9} color={CAST} />
      <HalfShell r={1.25} h={0.1} y={headBottom + 1.85} color={color} />
      <mesh position={[0, headBottom + 1.25, -0.9]} castShadow>
        <boxGeometry args={[2.2, 1.6, 0.12]} />
        <meshStandardMaterial color={CAST} {...metal} />
      </mesh>
      <Valve
        tipX={-tipX}
        tipY={valveTipY}
        tilt={valveTilt}
        drop={dropIn}
        color={color}
      />
      <Valve
        tipX={tipX}
        tipY={valveTipY}
        tilt={-valveTilt}
        drop={dropEx}
        color={color}
      />
      {cams.map((c, i) => (
        <CamShaft
          key={i}
          x={c.x}
          y={kind === "dohc" ? valveTipY + 0.32 : camY}
          a={camA}
          phase={c.phase}
          color={color}
          lobe={lobe}
        />
      ))}
      {kind === "dohc"
        ? [-tipX, tipX].map((x, i) => (
            <mesh
              key={x}
              position={[x, valveTipY + 0.06 - (i === 0 ? dropIn : dropEx), 0]}
              rotation={[0, 0, x < 0 ? valveTilt : -valveTilt]}
            >
              <cylinderGeometry args={[0.17, 0.17, 0.14, 24]} />
              <meshStandardMaterial color={METAL} {...metal} />
            </mesh>
          ))
        : rockers.map((r, i) => (
            <group
              key={i}
              position={[r.pivotX, camY + 0.33, 0]}
              rotation={[0, 0, r.tilt]}
            >
              {/* Cò mổ: đầu trong tì cam, đầu ngoài ép đuôi xupáp */}
              <mesh position={[r.side * 0.06, 0, 0]} castShadow>
                <boxGeometry args={[0.72, 0.1, 0.16]} />
                <meshStandardMaterial
                  color="#ffd21f"
                  metalness={0.5}
                  roughness={0.35}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
                <meshStandardMaterial color={METAL_DARK} {...metal} />
              </mesh>
            </group>
          ))}
      {showStroke ? <StrokeMarks crankR={crankR} /> : null}
    </group>
  );
};

const CamShaft = ({
  x,
  y,
  a,
  phase,
  color,
  lobe,
}: {
  readonly x: number;
  readonly y: number;
  readonly a: number;
  readonly phase: number;
  readonly color: string;
  readonly lobe: number;
}) => {
  const geo = useCamGeometry(0.2, lobe, 0.22);
  return (
    <group position={[x, y, 0]}>
      <mesh geometry={geo} rotation={[0, 0, a + phase]} castShadow>
        <meshStandardMaterial color={color} {...metal} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 16]} />
        <meshStandardMaterial color={METAL} {...metal} />
      </mesh>
    </group>
  );
};

// Hai vạch điểm chết trên/dưới (mặt đỉnh piston): khoảng giữa hai vạch = hành trình.
const StrokeMarks = ({ crankR }: { readonly crankR: number }) =>
  [crankR + ROD + 0.3, -crankR + ROD + 0.3].map((y) => (
    <mesh key={y} position={[0, y, 0.75]}>
      <boxGeometry args={[1.7, 0.035, 0.035]} />
      <meshBasicMaterial color="#ff3b30" />
    </mesh>
  ));

// ---------- Hộp số: tháp bánh răng trên trục chính + trục phụ ----------

export const GearTower = ({
  gears,
  angle,
  lit,
}: {
  readonly gears: number;
  readonly angle: number;
  // Số cấp đang được tô sáng (từ dưới lên).
  readonly lit: number;
}) => {
  const items = Array.from({ length: gears }, (_, i) => i);
  return (
    <group>
      {[-0.55, 0.55].map((x, s) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 4.2, 16]} />
            <meshStandardMaterial color={METAL} {...metal} />
          </mesh>
          {items.map((i) => {
            // Bánh răng trục chính nhỏ dần lên trên, trục phụ ngược lại → ăn khớp với nhau.
            const r = s === 0 ? 0.28 + i * 0.05 : 0.72 - i * 0.05;
            return (
              <Gear
                key={i}
                r={r}
                y={0.2 + i * 0.55}
                angle={
                  (s === 0
                    ? angle
                    : -angle * ((0.28 + i * 0.05) / (0.72 - i * 0.05))) +
                  i * 0.3
                }
                on={i < lit}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
};

const Gear = ({
  r,
  y,
  angle,
  on,
}: {
  readonly r: number;
  readonly y: number;
  readonly angle: number;
  readonly on: boolean;
}) => {
  const geo = useGearGeometry(r, Math.round(r * 40), 0.16);
  return (
    <mesh
      geometry={geo}
      position={[0, y, 0]}
      rotation={[0, angle, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={on ? "#f4e2b8" : "#9aa3ad"}
        metalness={on ? 0.35 : 0.7}
        roughness={0.35}
      />
    </mesh>
  );
};

// ---------- Phông studio ----------

export const StudioCanvas = ({
  width,
  height,
  cameraZ = 13,
  cameraY = 2.6,
  fov = 40,
  children,
}: {
  readonly width: number;
  readonly height: number;
  readonly cameraZ?: number;
  readonly cameraY?: number;
  readonly fov?: number;
  readonly children: React.ReactNode;
}) => (
  <ThreeCanvas
    width={width}
    height={height}
    shadows
    gl={{ alpha: true, antialias: true }}
    camera={{ position: [0, cameraY, cameraZ], fov }}
  >
    <ambientLight intensity={0.9} />
    <hemisphereLight args={["#dff0ff", "#c9ced4", 0.8]} />
    <directionalLight
      position={[5, 12, 8]}
      intensity={2.2}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={10}
      shadow-camera-bottom={-4}
    />
    <directionalLight position={[-6, 4, 6]} intensity={0.8} />
    {/* Sàn nhận bóng đổ */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <shadowMaterial opacity={0.22} />
    </mesh>
    {children}
  </ThreeCanvas>
);
