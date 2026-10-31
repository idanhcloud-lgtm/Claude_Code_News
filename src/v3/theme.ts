// Phiên bản 3 "Explainer bản đồ + số liệu": nền xanh đêm, nhấn vàng, chữ trắng.
export { fontFamily, SAFE } from "../theme";

export const night = {
  ocean: "#0b1422",
  land: "#17253a",
  landStroke: "#2c3e57",
  highlight: "#c8202f",
  yellow: "#ffd21f",
  text: "#ffffff",
  muted: "#9fb0c8",
  panel: "rgba(8,14,26,0.82)",
};

// Đồ hoạ số liệu ở nửa trên; bản đồ lấy trọng tâm ở nửa dưới để chấm, nhãn địa điểm không bị che.
export const STAGE = { top: 440, bottom: 960 };
export const MAP_CENTER_Y = 1150;
export const CUT_FRAMES = 8;
export const OUTRO_SECONDS = 3;
// Thời gian máy quay bản đồ bay tới vị trí mới ở đầu mỗi cảnh.
export const CAMERA_MOVE_SECONDS = 1.4;
