import {
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../elements/Background";
import { colors, fontFamily, SAFE } from "../theme";

type OutroSceneProps = {
  readonly showName: string;
  readonly callToAction: string;
  readonly accentColor: string;
};

const OutroSceneInner = ({
  showName,
  callToAction,
  accentColor,
}: OutroSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200 } });

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
          gap: 40,
          fontFamily,
          color: colors.text,
          textAlign: "center",
          // Tránh thanh tìm kiếm, phần mô tả và cột nút bên phải của TikTok.
          padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 100,
            // Chia dòng cân đối, tránh để một chữ lẻ ở dòng dưới.
            textWrap: "balance",
            opacity: pop,
            scale: interpolate(pop, [0, 1], [0.9, 1]),
          }}
        >
          {showName}
        </div>
        <div
          style={{
            padding: "18px 40px",
            borderRadius: 999,
            border: `4px solid ${accentColor}`,
            fontWeight: 600,
            fontSize: 40,
            opacity: interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {callToAction}
        </div>
      </div>
    </>
  );
};

export const OutroScene = Interactive.create({
  Component: OutroSceneInner,
  layout: "absolute-fill",
});
