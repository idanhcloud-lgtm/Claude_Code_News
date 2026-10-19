import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  staticFile,
  Track,
  useVideoConfig,
} from "remotion";
import { ProgressBar } from "./elements/ProgressBar";
import { SafeZoneGuide } from "./elements/SafeZoneGuide";
import { TopBar } from "./elements/TopBar";
import { HookScene } from "./scenes/HookScene";
import { OutroScene } from "./scenes/OutroScene";
import { ShotScene } from "./scenes/ShotScene";
import type { Story60Props } from "./schema";
import { colors, OUTRO_SECONDS, TRANSITION_FRAMES } from "./theme";

const HOOK_SECONDS = 3;
// Cắt cảnh nhanh hơn bản tin nhiều tin cho nhịp dồn dập.
const CUT_FRAMES = Math.round(TRANSITION_FRAMES / 2);

const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

// Thời lượng = hook + các cảnh + outro − phần chồng của chuyển cảnh.
// Muốn đúng 60 giây: tổng durationInSeconds của các cảnh ≈ 54 + 0,25 × (số cảnh + 1).
export const calculateStory60Metadata: CalculateMetadataFunction<
  Story60Props
> = ({ props }) => {
  const fps = 30;
  const scenes =
    HOOK_SECONDS * fps +
    props.shots.reduce(
      (sum, s) => sum + Math.round(s.durationInSeconds * fps),
      0,
    ) +
    OUTRO_SECONDS * fps;
  return {
    durationInFrames: scenes - (props.shots.length + 1) * CUT_FRAMES,
    fps,
  };
};

export const NewsStory60 = ({
  showName,
  date,
  accentColor,
  category,
  headline,
  hookMedia,
  hookCredit,
  hookTrimBeforeSeconds,
  hookFit,
  hookCutBottom,
  shots,
  voiceover,
  music,
  musicVolume,
  callToAction,
  showSafeZone,
}: Story60Props) => {
  const { fps } = useVideoConfig();
  const timing = linearTiming({ durationInFrames: CUT_FRAMES });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence
          name="Hook"
          durationInFrames={HOOK_SECONDS * fps}
        >
          <HookScene
            name="Hook"
            category={category}
            headline={headline}
            media={hookMedia}
            credit={hookCredit}
            trimBeforeSeconds={hookTrimBeforeSeconds}
            fit={hookFit}
            cutBottom={hookCutBottom}
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
              <ShotScene
                name={`Cảnh ${i + 1}`}
                media={shot.media}
                text={shot.text}
                credit={shot.credit}
                trimBeforeSeconds={shot.trimBeforeSeconds}
                volume={shot.volume}
                fit={shot.fit}
                cutBottom={shot.cutBottom}
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
          <OutroScene
            name="Outro"
            showName={showName}
            callToAction={callToAction}
            accentColor={accentColor}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Track name="Overlays">
        <TopBar
          name="Thanh trên"
          showName={showName}
          date={date}
          accentColor={accentColor}
        />
        <ProgressBar name="Tiến độ" accentColor={accentColor} />
      </Track>
      {voiceover ? <Audio src={resolveSrc(voiceover)} /> : null}
      {music ? <Audio src={resolveSrc(music)} volume={musicVolume} /> : null}
      <SafeZoneGuide show={showSafeZone} />
    </AbsoluteFill>
  );
};
