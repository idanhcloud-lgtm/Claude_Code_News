import { getRemotionEnvironment } from "remotion";
import { fontFamily, SAFE } from "../theme";

const zone = {
  position: "absolute",
  backgroundColor: "rgba(255, 0, 80, 0.18)",
  border: "2px dashed rgba(255, 0, 80, 0.8)",
  color: "rgba(255,255,255,0.85)",
  fontFamily,
  fontSize: 26,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
} as const;

// Chỉ hiện trong Remotion Studio để căn chỉnh — không bao giờ xuất hiện trong file render.
export const SafeZoneGuide = ({ show }: { readonly show: boolean }) => {
  if (!show || !getRemotionEnvironment().isStudio) {
    return null;
  }

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ ...zone, top: 0, left: 0, right: 0, height: SAFE.top }}>
        Thanh tìm kiếm · Đã follow · Dành cho bạn
      </div>
      <div
        style={{ ...zone, bottom: 0, left: 0, right: 0, height: SAFE.bottom }}
      >
        Tên kênh · Mô tả · Nhạc · Thanh điều hướng
      </div>
      <div
        style={{
          ...zone,
          top: SAFE.top,
          bottom: SAFE.bottom,
          right: 0,
          width: SAFE.right,
          writingMode: "vertical-rl",
        }}
      >
        Nút tim · bình luận · chia sẻ
      </div>
    </div>
  );
};
