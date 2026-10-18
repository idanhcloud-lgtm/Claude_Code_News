import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily, SAFE } from "../theme";

type TopBarProps = {
  readonly showName: string;
  readonly date: string;
  readonly accentColor: string;
};

const TopBarInner = ({ showName, date, accentColor }: TopBarProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        left: SAFE.left,
        right: SAFE.right,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily,
        color: colors.text,
        opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [0, 0.6 * fps],
          ["0px -30px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 18px",
          borderRadius: 8,
          backgroundColor: accentColor,
          fontWeight: 800,
          fontSize: 28,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.text,
            // Nhấp nháy theo frame (CSS animation không render được trong Remotion).
            opacity: 0.4 + 0.6 * Math.abs(Math.cos((frame / fps) * Math.PI)),
          }}
        />
        TRỰC TIẾP
      </div>
      <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 2 }}>
        {showName}
      </div>
      <div
        style={{
          marginLeft: "auto",
          fontWeight: 600,
          fontSize: 26,
          color: colors.textMuted,
        }}
      >
        {date}
      </div>
    </div>
  );
};

export const TopBar = Interactive.create({
  Component: TopBarInner,
  layout: "absolute-fill",
});
