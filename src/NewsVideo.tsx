import {
  linearTiming,
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  Track,
  useVideoConfig,
} from "remotion";
import { SafeZoneGuide } from "./elements/SafeZoneGuide";
import { Ticker } from "./elements/Ticker";
import { TopBar } from "./elements/TopBar";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { StoryScene } from "./scenes/StoryScene";
import type { NewsProps } from "./schema";
import {
  colors,
  INTRO_SECONDS,
  OUTRO_SECONDS,
  TRANSITION_FRAMES,
} from "./theme";

// Thời lượng video tự tính theo số tin và thời lượng từng tin.
export const calculateNewsMetadata: CalculateMetadataFunction<NewsProps> = ({
  props,
}) => {
  const fps = 30;
  const scenes =
    INTRO_SECONDS * fps +
    props.stories.reduce(
      (sum, s) => sum + Math.round(s.durationInSeconds * fps),
      0,
    ) +
    OUTRO_SECONDS * fps;
  const transitions = (props.stories.length + 1) * TRANSITION_FRAMES;
  return { durationInFrames: scenes - transitions, fps };
};

export const NewsVideo = ({
  showName,
  date,
  accentColor,
  ticker,
  tickerLabel,
  callToAction,
  showSafeZone,
  stories,
}: NewsProps) => {
  const { fps, durationInFrames } = useVideoConfig();
  const introFrames = INTRO_SECONDS * fps;
  const outroFrames = OUTRO_SECONDS * fps;
  // Thanh trên + ticker hiện trong phần tin, ẩn ở intro/outro.
  const overlayFrom = introFrames - TRANSITION_FRAMES;
  const overlayDuration =
    durationInFrames - overlayFrom - (outroFrames - TRANSITION_FRAMES);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name="Intro" durationInFrames={introFrames}>
          <IntroScene
            name="Intro"
            showName={showName}
            date={date}
            accentColor={accentColor}
          />
        </TransitionSeries.Sequence>
        {stories.map((story, i) => (
          // Mỗi tin là một scene, nối với nhau bằng hiệu ứng trượt mượt (spring).
          <React.Fragment key={i}>
            <TransitionSeries.Transition
              presentation={
                i === 0 ? fade() : slide({ direction: "from-right" })
              }
              timing={
                i === 0
                  ? linearTiming({ durationInFrames: TRANSITION_FRAMES })
                  : springTiming({
                      config: { damping: 200 },
                      durationInFrames: TRANSITION_FRAMES,
                    })
              }
            />
            <TransitionSeries.Sequence
              name={`Tin ${i + 1}`}
              durationInFrames={Math.round(story.durationInSeconds * fps)}
            >
              <StoryScene
                name={`Tin ${i + 1}`}
                category={story.category}
                headline={story.headline}
                summary={story.summary}
                image={story.image}
                source={story.source}
                accentColor={accentColor}
              />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence name="Outro" durationInFrames={outroFrames}>
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
          from={overlayFrom}
          durationInFrames={overlayDuration}
          showName={showName}
          date={date}
          accentColor={accentColor}
        />
        <Ticker
          name="Ticker"
          from={overlayFrom}
          durationInFrames={overlayDuration}
          items={ticker}
          label={tickerLabel}
          accentColor={accentColor}
        />
      </Track>
      <SafeZoneGuide show={showSafeZone} />
    </AbsoluteFill>
  );
};
