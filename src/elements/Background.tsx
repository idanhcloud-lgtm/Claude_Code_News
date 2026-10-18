import { Video } from "@remotion/media";
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

type BackgroundProps = {
  // Ảnh hoặc video: URL, hoặc đường dẫn trong public/ (vd: "media/canh-1.mp4"). Trống = nền gradient động.
  readonly image: string;
  readonly accentColor: string;
  // Chỉ áp dụng cho video: bỏ qua N giây đầu và âm lượng tiếng gốc (0 = tắt).
  readonly trimBeforeSeconds?: number;
  readonly volume?: number;
};

const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

const isVideo = (src: string) => /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(src);

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
}: BackgroundProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const renderMedia = () => {
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
          volume={volume}
          muted={volume === 0}
          style={{ ...cover, scale: interpolate(progress, [0, 1], [1, 1.06]) }}
        />
      );
    }
    return (
      <Img
        src={resolveSrc(image)}
        style={{
          ...cover,
          scale: interpolate(progress, [0, 1], [1.05, 1.18]),
          translate: interpolate(progress, [0, 1], ["0px 0px", "-30px -40px"]),
        }}
      />
    );
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {renderMedia()}
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
