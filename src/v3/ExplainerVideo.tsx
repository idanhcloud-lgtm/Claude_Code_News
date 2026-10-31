import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  Sequence,
  Track,
  useVideoConfig,
} from "remotion";
import { ProgressBar } from "../elements/ProgressBar";
import { SafeZoneGuide } from "../elements/SafeZoneGuide";
import { TopBar } from "../elements/TopBar";
import { OutroScene } from "../scenes/OutroScene";
import { ExplainerScene } from "./ExplainerScene";
import { MapLayer } from "./MapLayer";
import type { ExplainerProps } from "./schema";
import { CUT_FRAMES, fontFamily, night, OUTRO_SECONDS, SAFE } from "./theme";

export const calculateExplainerMetadata: CalculateMetadataFunction<
  ExplainerProps
> = ({ props }) => {
  const fps = 30;
  const frames =
    props.shots.reduce(
      (sum, s) => sum + Math.round(s.durationInSeconds * fps),
      0,
    ) +
    OUTRO_SECONDS * fps -
    props.shots.length * CUT_FRAMES;
  return { durationInFrames: frames, fps };
};

export const ExplainerVideo = ({
  showName,
  date,
  accentColor,
  route,
  routeNote,
  credit,
  shots,
  callToAction,
  showSafeZone,
}: ExplainerProps) => {
  const { fps } = useVideoConfig();
  const timing = linearTiming({ durationInFrames: CUT_FRAMES });
  const durations = shots.map((s) => Math.round(s.durationInSeconds * fps));
  const starts = durations.map((_, i) =>
    durations.slice(0, i).reduce((sum, d) => sum + d - CUT_FRAMES, 0),
  );
  const mapEnd = starts[starts.length - 1] + durations[durations.length - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: night.ocean }}>
      <Sequence name="Bản đồ" durationInFrames={mapEnd}>
        <MapLayer shots={shots} starts={starts} route={route} />
      </Sequence>
      <TransitionSeries name="Scenes">
        {shots.map((shot, i) => (
          <React.Fragment key={i}>
            {i > 0 ? (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={timing}
              />
            ) : null}
            <TransitionSeries.Sequence
              name={`Cảnh ${i + 1}`}
              durationInFrames={durations[i]}
            >
              <ExplainerScene
                name={`Cảnh ${i + 1}`}
                overlay={shot.overlay}
                captions={shot.captions}
                voice={shot.voice}
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
          name="Thanh tên kênh"
          showName={showName}
          date={date}
          accentColor={accentColor}
        />
        <ProgressBar name="Tiến độ" accentColor={accentColor} />
      </Track>
      <Sequence name="Nguồn" durationInFrames={mapEnd}>
        <div
          style={{
            position: "absolute",
            top: SAFE.top + 96,
            left: SAFE.left,
            right: SAFE.right,
            display: "flex",
            justifyContent: "space-between",
            fontFamily,
            fontWeight: 600,
            fontSize: 24,
            color: night.muted,
          }}
        >
          <span>{routeNote ?? ""}</span>
          <span>{credit}</span>
        </div>
      </Sequence>
      <SafeZoneGuide show={showSafeZone ?? false} />
    </AbsoluteFill>
  );
};
