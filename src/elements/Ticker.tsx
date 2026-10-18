import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily, SAFE } from "../theme";

type TickerProps = {
  readonly items: string[];
  readonly accentColor: string;
  readonly label: string;
};

// Tốc độ chạy chữ tính theo giây để chạy đều ở mọi fps.
const SPEED_PX_PER_SECOND = 150;
export const TICKER_HEIGHT = 84;

const TickerInner = ({ items, accentColor, label }: TickerProps) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const text = Array.from({ length: 8 }, () => items.join("   •   ")).join(
    "   •   ",
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        // Nằm ngay trên phần mô tả của TikTok để không bị che.
        bottom: SAFE.bottom,
        height: TICKER_HEIGHT,
        display: "flex",
        alignItems: "center",
        backgroundColor: colors.tickerBg,
        borderTop: `4px solid ${accentColor}`,
        fontFamily,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          backgroundColor: accentColor,
          color: colors.text,
          fontWeight: 800,
          fontSize: 34,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          whiteSpace: "nowrap",
          color: colors.text,
          fontWeight: 600,
          fontSize: 36,
          translate: `${width - (frame / fps) * SPEED_PX_PER_SECOND}px 0`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Ticker = Interactive.create({
  Component: TickerInner,
  layout: "absolute-fill",
});
