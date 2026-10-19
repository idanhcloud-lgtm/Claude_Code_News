import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE } from "../theme";

type ProgressBarProps = {
  readonly accentColor: string;
};

// Thanh tiến độ ngay dưới thanh tên kênh — giúp người xem ở lại tới cuối.
const ProgressBarInner = ({ accentColor }: ProgressBarProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + 72,
        left: SAFE.left,
        right: SAFE.left,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.2)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
          backgroundColor: accentColor,
        }}
      />
    </div>
  );
};

export const ProgressBar = Interactive.create({
  Component: ProgressBarInner,
  layout: "absolute-fill",
});
