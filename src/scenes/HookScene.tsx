import {
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../elements/Background";
import { resolveSrc } from "../media";
import { Credit } from "../elements/Credit";
import { colors, fontFamily, SAFE } from "../theme";

type HookSceneProps = {
  readonly category: string;
  readonly headline: string;
  readonly media: string;
  readonly credit: string;
  readonly trimBeforeSeconds: number;
  readonly fit: "frame" | "cover";
  readonly cutBottom?: number;
  readonly focusY?: number;
  readonly voice?: string;
  readonly accentColor: string;
};

// 3 giây đầu: tiêu đề lớn gây chú ý, đè lên tư liệu nổi bật nhất.
const HookSceneInner = ({
  category,
  headline,
  media,
  credit,
  trimBeforeSeconds,
  fit,
  cutBottom,
  focusY,
  voice,
  accentColor,
}: HookSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = headline.split(" ");
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });

  return (
    <>
      <Background
        image={media}
        accentColor={accentColor}
        trimBeforeSeconds={trimBeforeSeconds}
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
          gap: 28,
          fontFamily,
          color: colors.text,
        }}
      >
        <div
          style={{
            alignSelf: "flex-start",
            padding: "12px 26px",
            borderRadius: 10,
            backgroundColor: accentColor,
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: 2,
            textTransform: "uppercase",
            scale: interpolate(pop, [0, 1], [0.6, 1]),
            opacity: pop,
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.1,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {words.map((word, i) => {
            const p = spring({
              frame: frame - 4 - i * 2,
              fps,
              config: { damping: 200 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.25em",
                  opacity: p,
                  translate: `0px ${interpolate(p, [0, 1], [50, 0])}px`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <Credit credit={credit} />
      </div>
      {voice ? <Audio src={resolveSrc(voice)} /> : null}
    </>
  );
};

export const HookScene = Interactive.create({
  Component: HookSceneInner,
  layout: "absolute-fill",
});
