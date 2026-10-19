import { Video } from "@remotion/media";
import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { isVideo, resolveSrc } from "../media";
import { colors, SAFE } from "../theme";

type BackgroundProps = {
  // Ảnh hoặc video: URL, hoặc đường dẫn trong public/ (vd: "media/canh-1.mp4"). Trống = nền gradient động.
  readonly image: string;
  readonly accentColor: string;
  // Chỉ áp dụng cho video: bỏ qua N giây đầu và âm lượng tiếng gốc (0 = tắt).
  readonly trimBeforeSeconds?: number;
  readonly volume?: number;
  // "cover": phủ kín khung dọc (cắt bớt hai bên).
  // "frame": giữ nguyên khung ngang 16:9 ở nửa trên, nền phía sau là chính tư liệu đó làm mờ.
  // Dùng "frame" cho video/ảnh ngang có chủ thể nhỏ hoặc di chuyển ngang khung.
  readonly fit?: "cover" | "frame";
  // Chỉ cho "frame": cắt bỏ phần mép dưới (0–0.4), vd để giấu phụ đề in sẵn trong video nguồn.
  readonly cutBottom?: number;
  // Phần ảnh/video được giữ khi phải cắt: 0 = mép trên, 0.5 = giữa, 1 = mép dưới.
  readonly focusY?: number;
};

// Vị trí khung 16:9 ở chế độ "frame": ngay dưới thanh tên kênh và thanh tiến độ.
export const FRAME_TOP = SAFE.top + 120;

const cover = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
} as const;

// Nền cảnh: video, ảnh có hiệu ứng Ken Burns (zoom chậm), hoặc gradient động.
export const Background = ({
  image,
  accentColor,
  trimBeforeSeconds = 0,
  volume = 0,
  fit = "cover",
  cutBottom = 0,
  focusY = 0.5,
}: BackgroundProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const objectPosition = `50% ${focusY * 100}%`;
  const renderMedia = (extraStyle: React.CSSProperties, muted: boolean) => {
    if (!image) {
      return (
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `radial-gradient(circle at 30% 30%, ${accentColor}55, transparent 45%), radial-gradient(circle at 70% 75%, #1d4ed855, transparent 50%), ${colors.background}`,
            rotate: `${interpolate(progress, [0, 1], [0, 12])}deg`,
          }}
        />
      );
    }
    if (isVideo(image)) {
      return (
        <Video
          src={resolveSrc(image)}
          trimBefore={Math.round(trimBeforeSeconds * fps)}
          volume={muted ? 0 : volume}
          muted={muted || volume === 0}
          style={{
            ...cover,
            objectPosition,
            scale: interpolate(progress, [0, 1], [1, 1.06]),
            ...extraStyle,
          }}
        />
      );
    }
    return (
      <Img
        src={resolveSrc(image)}
        style={{
          ...cover,
          objectPosition,
          scale: interpolate(progress, [0, 1], [1.05, 1.18]),
          translate: interpolate(progress, [0, 1], ["0px 0px", "-30px -40px"]),
          ...extraStyle,
        }}
      />
    );
  };

  if (fit === "frame" && image) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {/* Nền mờ phủ kín khung dọc */}
        {renderMedia(
          { filter: "blur(40px) brightness(0.45)", scale: 1.3 },
          true,
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,8,15,0.35) 0%, rgba(5,8,15,0.1) 40%, rgba(5,8,15,0.85) 100%)",
          }}
        />
        {/* Tư liệu gốc giữ nguyên khung 16:9 */}
        <div
          style={{
            position: "absolute",
            top: FRAME_TOP,
            left: 0,
            right: 0,
            aspectRatio: `16 / ${9 * (1 - cutBottom)}`,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          {renderMedia({ height: `${100 / (1 - cutBottom)}%` }, false)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {renderMedia({}, false)}
      {/* Lớp tối giúp chữ luôn dễ đọc trên mọi ảnh/video */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,8,15,0.55) 0%, rgba(5,8,15,0.15) 30%, rgba(5,8,15,0.75) 60%, rgba(5,8,15,0.95) 100%)",
        }}
      />
    </div>
  );
};
