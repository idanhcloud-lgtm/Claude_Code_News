import { getPointAtLength } from "@remotion/paths";
import { useMemo } from "react";
import {
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolveSrc } from "../media";
import { PencilHand } from "./PencilHand";
import type { SketchData } from "./schema";
import { PANEL, paper } from "./theme";

type SketchDrawingProps = {
  readonly data: SketchData;
  readonly image: string;
  // Tỷ lệ thời lượng cảnh dành cho việc vẽ; sau đó ảnh thật hiện dần lên.
  readonly drawRatio: number;
};

// Kích thước khung vẽ theo tỷ lệ ảnh, không vượt PANEL.maxHeight.
export const panelSize = (data: SketchData) => {
  const scale = Math.min(
    PANEL.width / data.width,
    PANEL.maxHeight / data.height,
  );
  return { scale, width: data.width * scale, height: data.height * scale };
};

export const SketchDrawing = ({
  data,
  image,
  drawRatio,
}: SketchDrawingProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width: videoWidth } = useVideoConfig();
  const { scale, width, height } = panelSize(data);
  const left = (videoWidth - width) / 2;

  const starts = useMemo(() => {
    let sum = 0;
    return data.paths.map((p) => {
      const start = sum;
      sum += p.length;
      return start;
    });
  }, [data]);

  const drawStart = 0.2 * fps;
  const drawEnd = Math.max(drawStart + fps, durationInFrames * drawRatio);
  const reveal = 0.8 * fps;
  const drawn = interpolate(
    frame,
    [drawStart, drawEnd],
    [0, data.totalLength],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  // Nét đang vẽ = nét cuối cùng đã bắt đầu.
  let current = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= drawn) {
      current = i;
    } else {
      break;
    }
  }
  const currentPath = data.paths[current];
  const along = Math.min(
    currentPath.length,
    Math.max(0, drawn - starts[current]),
  );
  const tip = getPointAtLength(currentPath.d, along) ?? { x: 0, y: 0 };

  const photoOpacity = interpolate(frame, [drawEnd, drawEnd + reveal], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handOpacity = interpolate(
    frame,
    [drawEnd - 0.1 * fps, drawEnd + 0.3 * fps],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Rung tay rất nhẹ cho tự nhiên.
  const wobble = Math.sin(frame * 0.9) * 2;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: PANEL.top,
          left,
          width,
          height,
          backgroundColor: paper.sheet,
          borderRadius: 6,
          boxShadow: "0 18px 50px rgba(60,45,20,0.18)",
          overflow: "hidden",
        }}
      >
        <Img
          src={resolveSrc(image)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: photoOpacity,
          }}
        />
        <svg
          viewBox={`0 0 ${data.width} ${data.height}`}
          width={width}
          height={height}
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(photoOpacity, [0, 1], [1, 0.12]),
          }}
        >
          {data.paths.map((p, i) => {
            const visible = Math.min(p.length, Math.max(0, drawn - starts[i]));
            return visible <= 0 ? null : (
              <path
                key={i}
                d={p.d}
                fill="none"
                stroke={paper.ink}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${p.length + 1} ${p.length + 1}`}
                strokeDashoffset={p.length + 1 - visible}
              />
            );
          })}
        </svg>
      </div>
      <PencilHand
        x={left + tip.x * scale + wobble}
        y={PANEL.top + tip.y * scale + wobble * 0.5}
        opacity={handOpacity}
      />
    </>
  );
};
