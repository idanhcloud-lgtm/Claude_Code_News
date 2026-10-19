import { FRAME_TOP } from "./Background";
import { colors, fontFamily, SAFE } from "../theme";

// Nhãn đặt trên khung tư liệu, vd "VIDEO TƯ LIỆU · U17 CHÂU Á 5/2026",
// để người xem biết đây không phải cảnh quay của sự kiện hôm nay.
export const ArchiveLabel = ({ label }: { readonly label?: string }) => {
  if (!label) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: FRAME_TOP + 20,
        left: SAFE.left,
        padding: "6px 14px",
        borderRadius: 6,
        backgroundColor: "rgba(0,0,0,0.65)",
        border: "2px solid rgba(255,255,255,0.5)",
        color: colors.text,
        fontFamily,
        fontWeight: 600,
        fontSize: 26,
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
  );
};
