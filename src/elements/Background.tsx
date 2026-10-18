import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

type BackgroundProps = {
  readonly image: string;
  readonly accentColor: string;
};

const resolveSrc = (image: string) =>
  /^https?:\/\//.test(image) ? image : staticFile(image);

// Ảnh nền với hiệu ứng Ken Burns (zoom chậm). Không có ảnh => nền gradient động.
export const Background = ({ image, accentColor }: BackgroundProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {image ? (
        <Img
          src={resolveSrc(image)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: interpolate(progress, [0, 1], [1.05, 1.18]),
            translate: interpolate(
              progress,
              [0, 1],
              ["0px 0px", "-30px -40px"],
            ),
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `radial-gradient(circle at 30% 30%, ${accentColor}55, transparent 45%), radial-gradient(circle at 70% 75%, #1d4ed855, transparent 50%), ${colors.background}`,
            rotate: `${interpolate(progress, [0, 1], [0, 12])}deg`,
          }}
        />
      )}
      {/* Lớp tối giúp chữ luôn dễ đọc trên mọi ảnh */}
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
