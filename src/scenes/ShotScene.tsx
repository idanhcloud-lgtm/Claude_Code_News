import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../elements/Background";
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
  readonly accentColor: string;
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
        {text ? (
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
            <div
              style={{
                fontWeight: 800,
                fontSize: 64,
                lineHeight: 1.18,
                textShadow: "0 4px 24px rgba(0,0,0,0.6)",
              }}
            >
              {text}
            </div>
          </div>
        ) : null}
        <Credit credit={credit} />
      </div>
    </>
  );
};

export const ShotScene = Interactive.create({
  Component: ShotSceneInner,
  layout: "absolute-fill",
});
