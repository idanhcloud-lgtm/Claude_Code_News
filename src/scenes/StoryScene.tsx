import {
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../elements/Background";
import { TICKER_HEIGHT } from "../elements/Ticker";
import { colors, fontFamily, SAFE } from "../theme";

type StorySceneProps = {
  readonly category: string;
  readonly headline: string;
  readonly summary: string;
  readonly image: string;
  readonly source: string;
  readonly accentColor: string;
};

const StorySceneInner = ({
  category,
  headline,
  summary,
  image,
  source,
  accentColor,
}: StorySceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = headline.split(" ");

  return (
    <>
      <Background image={image} accentColor={accentColor} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.right,
          // Nội dung nằm trên ticker, tránh phần mô tả của TikTok.
          bottom: SAFE.bottom + TICKER_HEIGHT + 48,
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
            padding: "10px 22px",
            borderRadius: 8,
            backgroundColor: accentColor,
            fontWeight: 800,
            fontSize: 34,
            textTransform: "uppercase",
            translate: interpolate(
              spring({ frame, fps, config: { damping: 200 } }),
              [0, 1],
              ["-120% 0px", "0% 0px"],
            ),
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.12,
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {words.map((word, i) => {
            const p = spring({
              frame: frame - 6 - i * 2,
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
                  translate: `0px ${interpolate(p, [0, 1], [40, 0])}px`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: accentColor,
            width: `${interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 30], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}%`,
          }}
        />
        <div
          style={{
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.4,
            color: colors.textMuted,
            opacity: interpolate(frame, [1 * fps, 1.6 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1 * fps, 1.6 * fps],
              ["0px 24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          {summary}
        </div>
        {source ? (
          <div
            style={{
              fontWeight: 600,
              fontSize: 28,
              color: colors.textMuted,
              opacity: interpolate(frame, [1.4 * fps, 2 * fps], [0, 0.8], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Nguồn: {source}
          </div>
        ) : null}
      </div>
    </>
  );
};

export const StoryScene = Interactive.create({
  Component: StorySceneInner,
  layout: "absolute-fill",
});
