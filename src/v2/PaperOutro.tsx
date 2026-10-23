import {
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily, paper, SAFE } from "./theme";

type PaperOutroProps = {
  readonly showName: string;
  readonly callToAction: string;
  readonly accentColor: string;
};

const PaperOutroInner = ({
  showName,
  callToAction,
  accentColor,
}: PaperOutroProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200 } });

  return (
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
        textAlign: "center",
        padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 100,
          color: paper.ink,
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
          color: paper.ink,
          fontWeight: 600,
          fontSize: 40,
          opacity: interpolate(frame, [0.5 * fps, fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {callToAction}
      </div>
    </div>
  );
};

export const PaperOutro = Interactive.create({
  Component: PaperOutroInner,
  layout: "absolute-fill",
});
