import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import {
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "../elements/Captions";
import { resolveSrc } from "../media";
import { panelSize, SketchDrawing } from "./SketchDrawing";
import type { SketchData } from "./schema";
import { fontFamily, PANEL, paper, SAFE } from "./theme";

type SketchSceneProps = {
  readonly image: string;
  readonly sketchData?: SketchData;
  readonly text: string;
  readonly credit: string;
  readonly label?: string;
  readonly voice?: string;
  readonly captions?: Caption[];
  readonly accentColor: string;
  // Hook: có tiêu đề lớn + nhãn chuyên mục thay cho phụ đề.
  readonly headline?: string;
  readonly category?: string;
};

const textStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 64,
  lineHeight: 1.18,
  color: paper.ink,
};

const SketchSceneInner = ({
  image,
  sketchData,
  text,
  credit,
  label,
  voice,
  captions,
  accentColor,
  headline,
  category,
}: SketchSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200 } });
  const panelBottom = sketchData
    ? PANEL.top + panelSize(sketchData).height
    : PANEL.top;

  return (
    <>
      {sketchData ? (
        <SketchDrawing
          data={sketchData}
          image={image}
          drawRatio={headline ? 0.55 : 0.6}
        />
      ) : null}
      {label ? (
        <div
          style={{
            position: "absolute",
            top: PANEL.top + 16,
            left: SAFE.left + 16,
            padding: "6px 14px",
            borderRadius: 6,
            backgroundColor: "rgba(38,34,29,0.75)",
            color: "#fff",
            fontFamily,
            fontWeight: 600,
            fontSize: 26,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.right,
          top: panelBottom + 40,
          bottom: SAFE.bottom + 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 22,
          fontFamily,
        }}
      >
        {headline ? (
          <>
            <div
              style={{
                alignSelf: "flex-start",
                padding: "10px 24px",
                borderRadius: 10,
                backgroundColor: accentColor,
                color: "#fff",
                fontWeight: 800,
                fontSize: 38,
                textTransform: "uppercase",
                scale: interpolate(pop, [0, 1], [0.7, 1]),
                opacity: pop,
              }}
            >
              {category}
            </div>
            <div style={{ ...textStyle, fontSize: 80, lineHeight: 1.1 }}>
              {headline}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 22 }}>
            <div
              style={{
                width: 10,
                borderRadius: 5,
                backgroundColor: accentColor,
                flexShrink: 0,
              }}
            />
            {captions?.length ? (
              <Captions captions={captions} style={textStyle} />
            ) : (
              <div style={textStyle}>{text}</div>
            )}
          </div>
        )}
        <div
          style={{
            fontWeight: 600,
            fontSize: 28,
            color: paper.inkMuted,
          }}
        >
          Nguồn: {credit}
        </div>
      </div>
      {voice ? <Audio src={resolveSrc(voice)} /> : null}
    </>
  );
};

export const SketchScene = Interactive.create({
  Component: SketchSceneInner,
  layout: "absolute-fill",
});
