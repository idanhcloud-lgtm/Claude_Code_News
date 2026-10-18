import { Composition, Folder } from "remotion";
import { Ticker } from "./elements/Ticker";
import { TopBar } from "./elements/TopBar";
import { calculateNewsMetadata, NewsVideo } from "./NewsVideo";
import { calculateStory60Metadata, NewsStory60 } from "./NewsStory60";
import { ProgressBar } from "./elements/ProgressBar";
import { HookScene } from "./scenes/HookScene";
import { ShotScene } from "./scenes/ShotScene";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { StoryScene } from "./scenes/StoryScene";
import { newsSchema, story60Schema } from "./schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NewsVertical"
        component={NewsVideo}
        schema={newsSchema}
        calculateMetadata={calculateNewsMetadata}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showName: "BẢN TIN 60s",
          date: "18/10/2026",
          accentColor: "#e11d2e",
          tickerLabel: "TIN NHANH",
          ticker: [
            "Đây là nội dung mẫu — thay bằng tin thật của bạn",
            "Giá vàng, tỷ giá, thời tiết cập nhật mỗi ngày",
            "Theo dõi kênh để không bỏ lỡ bản tin tiếp theo",
          ],
          callToAction: "Theo dõi để xem bản tin mỗi ngày",
          showSafeZone: true,
          stories: [
            {
              category: "Công nghệ",
              headline: "Tiêu đề tin thứ nhất ngắn gọn, nổi bật trong 1–2 dòng",
              summary:
                "Tóm tắt 1–2 câu: chuyện gì xảy ra, ai liên quan, vì sao đáng chú ý.",
              image: "",
              source: "Nguồn tin",
              durationInSeconds: 6,
            },
            {
              category: "Kinh tế",
              headline: "Tiêu đề tin thứ hai: con số chính đặt lên đầu",
              summary: "Bổ sung bối cảnh và tác động tới người xem.",
              image: "",
              source: "Nguồn tin",
              durationInSeconds: 6,
            },
            {
              category: "Đời sống",
              headline: "Tiêu đề tin thứ ba để kết thúc bản tin",
              summary: "Một câu tóm lại ý chính của tin.",
              image: "",
              source: "Nguồn tin",
              durationInSeconds: 6,
            },
          ],
        }}
      />
      <Composition
        id="TinNong60s"
        component={NewsStory60}
        schema={story60Schema}
        calculateMetadata={calculateStory60Metadata}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showName: "BẢN TIN 60s",
          date: "18/10/2026",
          accentColor: "#e11d2e",
          category: "Nóng",
          headline: "Tiêu đề gây chú ý trong 3 giây đầu",
          hookMedia: "",
          hookCredit: "Tên báo / nguồn tư liệu",
          hookTrimBeforeSeconds: 0,
          hookFit: "frame",
          shots: [
            {
              media: "",
              text: "Ý chính 1: chuyện gì vừa xảy ra",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
            {
              media: "",
              text: "Ý chính 2: xảy ra ở đâu, khi nào",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
            {
              media: "",
              text: "Ý chính 3: con số quan trọng nhất",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
            {
              media: "",
              text: "Ý chính 4: ai liên quan, họ nói gì",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
            {
              media: "",
              text: "Ý chính 5: nguyên nhân",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
            {
              media: "",
              text: "Ý chính 6: ảnh hưởng tới người xem",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
            {
              media: "",
              text: "Ý chính 7: diễn biến tiếp theo",
              credit: "Tên báo / nguồn tư liệu",
              durationInSeconds: 8,
              trimBeforeSeconds: 0,
              volume: 0,
              fit: "frame",
            },
          ],
          voiceover: "",
          music: "",
          musicVolume: 0.15,
          callToAction: "Theo dõi để xem bản tin mỗi ngày",
          showSafeZone: true,
        }}
      />
      <Folder name="Scenes">
        <Composition
          id="IntroScene"
          component={IntroScene}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            showName: "BẢN TIN 60s",
            date: "18/10/2026",
            accentColor: "#e11d2e",
          }}
        />
        <Composition
          id="StoryScene"
          component={StoryScene}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            category: "Công nghệ",
            headline: "Tiêu đề tin ngắn gọn, nổi bật trong 1–2 dòng",
            summary: "Tóm tắt 1–2 câu về nội dung chính của tin.",
            image: "",
            source: "Nguồn tin",
            accentColor: "#e11d2e",
          }}
        />
        <Composition
          id="HookScene"
          component={HookScene}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            category: "Nóng",
            headline: "Tiêu đề gây chú ý trong 3 giây đầu",
            media: "",
            credit: "Tên báo / nguồn tư liệu",
            trimBeforeSeconds: 0,
            fit: "frame",
            accentColor: "#e11d2e",
          }}
        />
        <Composition
          id="ShotScene"
          component={ShotScene}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            media: "",
            text: "Ý chính của cảnh, ngắn gọn 1–2 dòng",
            credit: "Tên báo / nguồn tư liệu",
            trimBeforeSeconds: 0,
            volume: 0,
            fit: "frame",
            accentColor: "#e11d2e",
          }}
        />
        <Composition
          id="OutroScene"
          component={OutroScene}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            showName: "BẢN TIN 60s",
            callToAction: "Theo dõi để xem bản tin mỗi ngày",
            accentColor: "#e11d2e",
          }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="TopBar"
          component={TopBar}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            showName: "BẢN TIN 60s",
            date: "18/10/2026",
            accentColor: "#e11d2e",
            style: { backgroundColor: "#0b1220" },
          }}
        />
        <Composition
          id="Ticker"
          component={Ticker}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            label: "TIN NHANH",
            items: ["Tin nhanh thứ nhất", "Tin nhanh thứ hai"],
            accentColor: "#e11d2e",
            style: { backgroundColor: "#0b1220" },
          }}
        />
        <Composition
          id="ProgressBar"
          component={ProgressBar}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            accentColor: "#e11d2e",
            style: { backgroundColor: "#0b1220" },
          }}
        />
      </Folder>
    </>
  );
};
