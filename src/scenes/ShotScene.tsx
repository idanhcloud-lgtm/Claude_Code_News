import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { Background } from "../elements/Background";
import { Captions } from "../elements/Captions";
import { resolveSrc } from "../media";
import { Credit } from "../elements/Credit";
import { colors, fontFamily, SAFE } from "../theme";

type ShotSceneProps = {
  readonly media: string;
  readonly text: string;
  readonly credit: string;
  readonly trimBeforeSeconds: number;
  readonly volume: number;
  readonly fit: "frame" | "cover";
  readonly cutBottom?: number;
  readonly focusY?: number;
  readonly voice?: string;
  readonly captions?: Caption[];
  readonly accentColor: string;
};

const textStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 64,
  lineHeight: 1.18,
  textShadow: "0 4px 24px rgba(0,0,0,0.6)",
};

// Một cảnh tư liệu: video/ảnh toàn màn hình + ý chính + nguồn.
const ShotSceneInner = ({
  media,
  text,
  credit,
  trimBeforeSeconds,
  volume,
  fit,
  cutBottom,
  focusY,
  voice,
  captions,
  accentColor,
}: ShotSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <>
      <Background
        image={media}
        accentColor={accentColor}
        trimBeforeSeconds={trimBeforeSeconds}
        volume={volume}
        fit={fit}
        cutBottom={cutBottom}
        focusY={focusY}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.right,
          bottom: SAFE.bottom + 40,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          fontFamily,
          color: colors.text,
        }}
      >
        {text || captions?.length ? (
          <div
            style={{
              display: "flex",
              gap: 24,
              opacity: enter,
              translate: `0px ${interpolate(enter, [0, 1], [40, 0])}px`,
            }}
          >
            <div
              style={{
                width: 10,
                borderRadius: 5,
                backgroundColor: accentColor,
                flexShrink: 0,
              }}
            />
            {/* Có phụ đề theo giọng đọc thì hiện phụ đề, không thì hiện ý chính cố định */}
            {captions?.length ? (
              <Captions captions={captions} style={textStyle} />
            ) : (
              <div style={textStyle}>{text}</div>
            )}
          </div>
        ) : null}
        <Credit credit={credit} />
      </div>
      {voice ? <Audio src={resolveSrc(voice)} /> : null}
    </>
  );
};

export const ShotScene = Interactive.create({
  Component: ShotSceneInner,
  layout: "absolute-fill",
});
