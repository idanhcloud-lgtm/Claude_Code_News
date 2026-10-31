import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { Interactive } from "remotion";
import { Captions } from "../elements/Captions";
import { resolveSrc } from "../media";
import { OverlayView } from "./Overlays";
import type { Overlay } from "./schema";
import { fontFamily, night, SAFE } from "./theme";

type ExplainerSceneProps = {
  readonly overlay?: Overlay;
  readonly captions?: Caption[];
  readonly voice?: string;
};

// Một cảnh: đồ hoạ số liệu (nếu có) + phụ đề trắng theo lời đọc ở chân khung.
const ExplainerSceneInner = ({
  overlay,
  captions,
  voice,
}: ExplainerSceneProps) => (
  <>
    {overlay ? <OverlayView overlay={overlay} /> : null}
    {captions?.length ? (
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.right,
          bottom: SAFE.bottom + 30,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Captions
          captions={captions}
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 52,
            lineHeight: 1.2,
            color: night.text,
            textAlign: "center",
            textWrap: "balance",
            textShadow: "0 3px 14px rgba(0,0,0,0.95)",
          }}
        />
      </div>
    ) : null}
    {voice ? <Audio src={resolveSrc(voice)} /> : null}
  </>
);

export const ExplainerScene = Interactive.create({
  Component: ExplainerSceneInner,
  layout: "absolute-fill",
});
