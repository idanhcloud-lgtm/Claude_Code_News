import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { blueprint } from "./theme";

// Mô hình 3D cơ cấu phân phối khí và piston. Mọi chuyển động tính theo useCurrentFrame()
// (không dùng useFrame của React Three Fiber) để render không bị nháy.

const CAM_R = 0.55;
const LOBE = 0.36;
const STEEL = "#c9d2dc";
const DARK_STEEL = "#7d8794";

const lobeLift = (a: number, phase: number, dir: number) =>
  LOBE * Math.max(0, Math.cos(dir - (a + phase))) ** 3;

// Biên dạng vấu cam (đứng yên, quay bằng rotation của mesh).
const useCamGeometry = () =>
  useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      const r = CAM_R + LOBE * Math.max(0, Math.cos(t)) ** 3;
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 2,
    });
    g.translate(0, 0, -0.16);
    return g;
  }, []);

// Lò xo xupáp: ống xoắn tạo một lần, co giãn bằng scale theo trục y.
const useSpringGeometry = () =>
  useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 7;
    for (let i = 0; i <= turns * 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          0.26 * Math.cos(t),
          i / (turns * 24),
          0.26 * Math.sin(t),
        ),
      );
    }
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts),
      400,
      0.035,
      8,
      false,
    );
  }, []);

const Lights = () => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[6, 9, 8]} intensity={1.6} />
    <directionalLight position={[-6, 3, -4]} intensity={0.7} color="#7aa8ff" />
    <pointLight position={[0, 6, 6]} intensity={18} distance={20} />
  </>
);

// Xupáp: thân + nấm + lò xo + đĩa chặn. `drop` = khoảng xupáp bị đẩy xuống.
const Valve = ({
  x,
  drop,
  color,
}: {
  readonly x: number;
  readonly drop: number;
  readonly color: string;
}) => {
  const springGeo = useSpringGeometry();
  const springBottom = -0.1;
  const springTop = 1.25 - drop;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.55 - drop, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.3, 16]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.62 - drop, 0]}>
        <cylinderGeometry args={[0.07, 0.42, 0.18, 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh
        geometry={springGeo}
        position={[0, springBottom, 0]}
        scale={[1, springTop - springBottom, 1]}
      >
        <meshStandardMaterial
          color={DARK_STEEL}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, springTop, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.07, 32]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
};

const Cam = ({
  x,
  y,
  z,
  a,
  phase,
  color,
}: {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly a: number;
  readonly phase: number;
  readonly color: string;
}) => {
  const geo = useCamGeometry();
  return (
    <mesh geometry={geo} position={[x, y, z]} rotation={[0, 0, a + phase]}>
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    </mesh>
  );
};

const Shaft = ({
  x,
  y,
  length,
  r = 0.16,
}: {
  readonly x: number;
  readonly y: number;
  readonly length: number;
  readonly r?: number;
}) => (
  <mesh position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[r, r, length, 24]} />
    <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
  </mesh>
);

// Khối đầu xy-lanh dạng kính mờ để nhìn xuyên vào trong.
const HeadBlock = ({
  width,
  y = -1.0,
}: {
  readonly width: number;
  readonly y?: number;
}) => (
  <mesh position={[0, y, 0]}>
    <boxGeometry args={[width, 0.5, 1.8]} />
    <meshStandardMaterial
      color="#5d7aa8"
      transparent
      opacity={0.22}
      metalness={0.2}
      roughness={0.6}
    />
  </mesh>
);

const useTurntable = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Góc cam quay ~0,8 vòng/giây; mô hình xoay nhẹ qua lại để thấy chiều sâu.
  return { a: t * Math.PI * 1.6, yaw: -0.5 + Math.sin(t * 0.6) * 0.35, t };
};

export const Sohc3D = ({
  color,
  width,
  height,
}: {
  readonly color: string;
  readonly width: number;
  readonly height: number;
}) => {
  const { a, yaw } = useTurntable();
  const up = Math.PI / 2;
  // Cò mổ nằm trên trục cam: đầu trong tì lên vấu cam, đầu ngoài ép đuôi xupáp.
  // Vấu nâng đầu trong lên → cò mổ xoay quanh trục → đầu ngoài ép xupáp xuống.
  const CAM_Y = 2.25;
  const ROCKER_Y = CAM_Y + CAM_R + 0.11;
  const INNER = 0.8;
  const OUTER = 0.85;
  const rocker = (side: -1 | 1, lift: number) => {
    const tilt = -side * (lift / INNER);
    return {
      side,
      tilt,
      pivotX: side * 1.05,
      drop: OUTER * Math.sin(Math.abs(tilt)),
    };
  };
  const L = rocker(-1, lobeLift(a, 0, up));
  const R = rocker(1, lobeLift(a, Math.PI * 0.85, up));
  // Nâng cụm xupáp để đuôi xupáp chạm mặt dưới cò mổ.
  const VALVE_LIFT_Y = ROCKER_Y - 0.11 - 1.7;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 2.4, 7.0], fov: 42 }}
    >
      <Lights />
      <group rotation={[0.12, yaw, 0]} position={[0, -1.0, 0]}>
        <Shaft x={0} y={CAM_Y} length={2.4} />
        <Cam x={0} y={CAM_Y} z={-0.42} a={a} phase={0} color={color} />
        <Cam
          x={0}
          y={CAM_Y}
          z={0.42}
          a={a}
          phase={Math.PI * 0.85}
          color={color}
        />
        {[L, R].map((r, i) => (
          <group
            key={i}
            position={[r.pivotX, ROCKER_Y, i === 0 ? -0.42 : 0.42]}
            rotation={[0, 0, r.tilt]}
          >
            {/* Thân cò mổ: từ đầu tì cam (phía trong) tới đầu ép xupáp (phía ngoài) */}
            <mesh position={[(r.side * (OUTER - INNER)) / 2, 0, 0]}>
              <boxGeometry args={[INNER + OUTER, 0.22, 0.3]} />
              <meshStandardMaterial
                color={blueprint.yellow}
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.4, 20]} />
              <meshStandardMaterial
                color={STEEL}
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}
        <Shaft x={-1.05} y={ROCKER_Y} length={2.2} r={0.08} />
        <Shaft x={1.05} y={ROCKER_Y} length={2.2} r={0.08} />
        <group position={[0, VALVE_LIFT_Y, -0.42]}>
          <Valve x={-1.9} drop={L.drop} color={color} />
        </group>
        <group position={[0, VALVE_LIFT_Y, 0.42]}>
          <Valve x={1.9} drop={R.drop} color={color} />
        </group>
        <HeadBlock width={5.2} y={-1.0 + VALVE_LIFT_Y} />
      </group>
    </ThreeCanvas>
  );
};

export const Dohc3D = ({
  color,
  width,
  height,
}: {
  readonly color: string;
  readonly width: number;
  readonly height: number;
}) => {
  const { a, yaw } = useTurntable();
  const down = -Math.PI / 2;
  const dropL = lobeLift(a, 0, down) * 1.1;
  const dropR = lobeLift(a, Math.PI * 0.85, down) * 1.1;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 2.0, 7.2], fov: 42 }}
    >
      <Lights />
      <group rotation={[0.12, yaw, 0]} position={[0, -0.4, 0]}>
        {[-1.2, 1.2].map((x, i) => (
          <group key={x}>
            <Shaft x={x} y={2.35} length={2.4} />
            <Cam
              x={x}
              y={2.35}
              z={0}
              a={a}
              phase={i === 0 ? 0 : Math.PI * 0.85}
              color={color}
            />
            {/* Cốc đẩy nằm giữa vấu cam và đuôi xupáp */}
            <mesh position={[x, 1.55 - (i === 0 ? dropL : dropR), 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.3, 32]} />
              <meshStandardMaterial
                color={STEEL}
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
            <Valve x={x} drop={i === 0 ? dropL : dropR} color={color} />
          </group>
        ))}
        <HeadBlock width={4.4} />
      </group>
    </ThreeCanvas>
  );
};

// Hai bộ piston – tay biên – trục khuỷu đặt cạnh nhau. crankR lớn hơn = hành trình dài hơn.
const PistonUnit = ({
  x,
  crankR,
  color,
  theta,
}: {
  readonly x: number;
  readonly crankR: number;
  readonly color: string;
  readonly theta: number;
}) => {
  const rod = 2.0;
  const cy = -1.8;
  const pinX = crankR * Math.sin(theta);
  const pinY = cy + crankR * Math.cos(theta);
  const pistonY =
    cy +
    crankR * Math.cos(theta) +
    Math.sqrt(rod * rod - (crankR * Math.sin(theta)) ** 2);
  const rodMidX = pinX / 2;
  const rodMidY = (pinY + pistonY) / 2;
  const rodAngle = Math.atan2(pistonY - pinY, 0 - pinX) - Math.PI / 2;
  const tdc = cy + crankR + rod;
  const bdc = cy - crankR + rod;
  return (
    <group position={[x, 0, 0]}>
      {/* Thành xy-lanh trong suốt */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 3.0, 40, 1, true]} />
        <meshStandardMaterial
          color="#8fb3ff"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Piston */}
      <mesh position={[0, pistonY + 0.25, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.6, 40]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Tay biên */}
      <mesh position={[rodMidX, rodMidY, 0]} rotation={[0, 0, rodAngle]}>
        <boxGeometry args={[0.16, rod, 0.18]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Má khuỷu + chốt khuỷu */}
      <mesh position={[0, cy, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[crankR + 0.25, crankR + 0.25, 0.14, 40]} />
        <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[pinX, pinY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 20]} />
        <meshStandardMaterial
          color={blueprint.yellow}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Mốc điểm chết trên / dưới: khoảng cách giữa hai vạch = hành trình */}
      {[tdc + 0.55, bdc + 0.55].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.7, 0.03, 0.03]} />
          <meshBasicMaterial color={blueprint.yellow} />
        </mesh>
      ))}
    </group>
  );
};

export const Pistons3D = ({
  width,
  height,
}: {
  readonly width: number;
  readonly height: number;
}) => {
  const { t, yaw } = useTurntable();
  const theta = t * Math.PI * 2 * 0.9;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 0.5, 7.4], fov: 42 }}
    >
      <Lights />
      <group rotation={[0.08, yaw * 0.6, 0]} position={[0, -0.2, 0]}>
        <PistonUnit
          x={-1.6}
          crankR={0.62}
          color={blueprint.exciter}
          theta={theta}
        />
        <PistonUnit
          x={1.6}
          crankR={0.5}
          color={blueprint.winner}
          theta={theta}
        />
      </group>
    </ThreeCanvas>
  );
};
