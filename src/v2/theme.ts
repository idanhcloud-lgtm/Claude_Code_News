// Phiên bản 2 "Vẽ tay ảnh thời sự": nền giấy sáng, chữ mực tối. Dùng chung font và vùng an toàn với v1.
export { fontFamily, SAFE } from "../theme";

export const paper = {
  background: "#f4efe4",
  sheet: "#fbf8f1",
  ink: "#26221d",
  inkMuted: "#6b6358",
  line: "rgba(38,34,29,0.12)",
};

// Khung vẽ: rộng gần hết khung dọc, ngay dưới thanh tên kênh + thanh tiến độ.
export const PANEL = { top: 370, width: 1000, maxHeight: 700 };
export const CUT_FRAMES = 8;
export const OUTRO_SECONDS = 3;
