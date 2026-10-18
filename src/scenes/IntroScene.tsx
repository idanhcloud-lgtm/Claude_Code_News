import {
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../elements/Background";
import { colors, fontFamily, SAFE } from "../theme";

type IntroSceneProps = {
  readonly showName: string;
  readonly date: string;
  readonly accentColor: string;
};

const IntroSceneInner = ({ showName, date, accentColor }: IntroSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <>
      <Background image="" accentColor={accentColor} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
          fontFamily,
          color: colors.text,
          textAlign: "center",
          // Tránh thanh tìm kiếm, phần mô tả và cột nút bên phải của TikTok.
          padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`,
        }}
      >
        <div
          style={{
            padding: "14px 36px",
            borderRadius: 12,
            backgroundColor: accentColor,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: 4,
            scale: interpolate(pop, [0, 1], [0.6, 1]),
            opacity: pop,
          }}
        >
          TIN NÓNG
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 120,
            lineHeight: 1.05,
            letterSpacing: 2,
            opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [0.3 * fps, 0.9 * fps],
              ["0px 60px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          {showName}
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 44,
            color: colors.textMuted,
            opacity: interpolate(frame, [0.8 * fps, 1.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {date}
        </div>
      </div>
    </>
  );
};

export const IntroScene = Interactive.create({
  Component: IntroSceneInner,
  layout: "absolute-fill",
});
