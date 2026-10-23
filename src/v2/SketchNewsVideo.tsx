import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  Track,
  useVideoConfig,
} from "remotion";
import { SafeZoneGuide } from "../elements/SafeZoneGuide";
import { resolveSrc } from "../media";
import { PaperOutro } from "./PaperOutro";
import { PaperTopBar } from "./PaperTopBar";
import type { SketchData, SketchStoryProps } from "./schema";
import { SketchScene } from "./SketchScene";
import { CUT_FRAMES, OUTRO_SECONDS, paper } from "./theme";

const DEFAULT_HOOK_SECONDS = 4;

// Tải trước toàn bộ nét vẽ (JSON) và tính thời lượng video.
export const calculateSketchMetadata: CalculateMetadataFunction<
  SketchStoryProps
> = async ({ props }) => {
  const fps = 30;
  const files = [props.hookSketch, ...props.shots.map((s) => s.sketch)];
  const sketches: Record<string, SketchData> = {};
  await Promise.all(
    files.map(async (file) => {
      // Thiếu file (vd tư liệu chưa tải) thì bỏ qua: cảnh hiện không có nét vẽ thay vì lỗi cả video.
      try {
        const res = await fetch(resolveSrc(file));
        if (res.ok) {
          sketches[file] = (await res.json()) as SketchData;
        }
      } catch {
        // bỏ qua
      }
    }),
  );
  const frames =
    Math.round((props.hookDurationInSeconds ?? DEFAULT_HOOK_SECONDS) * fps) +
    props.shots.reduce(
      (sum, s) => sum + Math.round(s.durationInSeconds * fps),
      0,
    ) +
    OUTRO_SECONDS * fps -
    (props.shots.length + 1) * CUT_FRAMES;
  return { durationInFrames: frames, fps, props: { ...props, sketches } };
};

export const SketchNewsVideo = ({
  showName,
  date,
  accentColor,
  category,
  headline,
  hookImage,
  hookSketch,
  hookCredit,
  hookLabel,
  hookDurationInSeconds,
  hookVoice,
  shots,
  callToAction,
  showSafeZone,
  sketches,
}: SketchStoryProps) => {
  const { fps } = useVideoConfig();
  const timing = linearTiming({ durationInFrames: CUT_FRAMES });

  return (
    <AbsoluteFill style={{ backgroundColor: paper.background }}>
      {/* Vân giấy rất nhẹ */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity: 0.35 }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={3}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity={0.25} />
      </svg>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence
          name="Hook"
          durationInFrames={Math.round(
            (hookDurationInSeconds ?? DEFAULT_HOOK_SECONDS) * fps,
          )}
        >
          <SketchScene
            name="Hook"
            image={hookImage}
            sketchData={sketches?.[hookSketch]}
            text={headline}
            headline={headline}
            category={category}
            credit={hookCredit}
            label={hookLabel}
            voice={hookVoice}
            accentColor={accentColor}
          />
        </TransitionSeries.Sequence>
        {shots.map((shot, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Transition
              presentation={fade()}
              timing={timing}
            />
            <TransitionSeries.Sequence
              name={`Cảnh ${i + 1}`}
              durationInFrames={Math.round(shot.durationInSeconds * fps)}
            >
              <SketchScene
                name={`Cảnh ${i + 1}`}
                image={shot.image}
                sketchData={sketches?.[shot.sketch]}
                text={shot.text}
                credit={shot.credit}
                label={shot.label}
                voice={shot.voice}
                captions={shot.captions}
                accentColor={accentColor}
              />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence
          name="Outro"
          durationInFrames={OUTRO_SECONDS * fps}
        >
          <PaperOutro
            name="Outro"
            showName={showName}
            callToAction={callToAction}
            accentColor={accentColor}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Track name="Overlays">
        <PaperTopBar
          name="Thanh tên kênh"
          showName={showName}
          date={date}
          accentColor={accentColor}
        />
      </Track>
      <SafeZoneGuide show={showSafeZone ?? false} />
    </AbsoluteFill>
  );
};
