import type { Caption } from "@remotion/captions";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type CaptionsProps = {
  readonly captions: Caption[];
  readonly style: React.CSSProperties;
};

// Phụ đề chạy theo lời đọc: hiện cụm câu đang được đọc, mỗi cụm trượt nhẹ vào.
export const Captions = ({ captions, style }: CaptionsProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;
  const current =
    [...captions].reverse().find((c) => c.startMs <= nowMs) ?? captions[0];
  const enter = interpolate(
    nowMs,
    [current.startMs, current.startMs + 250],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div
      style={{
        ...style,
        opacity: enter,
        translate: `0px ${interpolate(enter, [0, 1], [24, 0])}px`,
      }}
    >
      {/* Cụm sau dấu phẩy vẫn viết hoa chữ đầu cho dễ đọc */}
      {current.text.charAt(0).toUpperCase() + current.text.slice(1)}
    </div>
  );
};
