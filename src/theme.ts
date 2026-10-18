import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Be Vietnam Pro (font của Việt Nam, hiển thị dấu chuẩn) được đóng gói sẵn
// trong public/fonts để render offline, nhanh và không phụ thuộc mạng.
// loadFont() tự chặn render cho tới khi font tải xong.
export const fontFamily = "Be Vietnam Pro";

const weights = [
  ["400", "Regular"],
  ["600", "SemiBold"],
  ["800", "ExtraBold"],
] as const;

for (const [weight, file] of weights) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/BeVietnamPro-${file}.ttf`),
    weight,
  });
}

export const colors = {
  background: "#0b1220",
  text: "#ffffff",
  textMuted: "#c3cbdb",
  tickerBg: "rgba(8, 13, 24, 0.92)",
};

// Video dọc 9:16 cho TikTok / Reels / Shorts.
export const VIDEO = { width: 1080, height: 1920, fps: 30 };

// Vùng an toàn cho TikTok (khung 1080x1920), cũng an toàn cho Reels / Shorts:
// - top: thanh tìm kiếm + tab "Đã follow · Dành cho bạn" + LIVE
// - bottom: tên kênh, mô tả (caption), nhạc nền, thanh điều hướng
// - right: cột avatar / tim / bình luận / lưu / chia sẻ
// Không đặt chữ hay chi tiết quan trọng trong các vùng này.
export const SAFE = { top: 260, bottom: 480, left: 64, right: 160 };

// Thời lượng chuyển cảnh giữa các scene (frame).
export const TRANSITION_FRAMES = 15;
export const INTRO_SECONDS = 3;
export const OUTRO_SECONDS = 3;
