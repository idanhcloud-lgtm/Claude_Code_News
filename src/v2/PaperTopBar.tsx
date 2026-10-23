import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, paper, SAFE } from "./theme";

type PaperTopBarProps = {
  readonly showName: string;
  readonly date: string;
  readonly accentColor: string;
};

// Thanh tên kênh + ngày + thanh tiến độ, màu mực trên nền giấy.
const PaperTopBarInner = ({
  showName,
  date,
  accentColor,
}: PaperTopBarProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        left: SAFE.left,
        right: SAFE.right,
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            backgroundColor: accentColor,
            color: "#fff",
            fontWeight: 800,
            fontSize: 30,
          }}
        >
          {showName}
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontWeight: 600,
            fontSize: 26,
            color: paper.inkMuted,
          }}
        >
          {date}
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          height: 6,
          borderRadius: 3,
          backgroundColor: paper.line,
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
    </div>
  );
};

export const PaperTopBar = Interactive.create({
  Component: PaperTopBarInner,
  layout: "absolute-fill",
});
