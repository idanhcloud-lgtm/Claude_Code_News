import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "../theme";

// Dòng ghi nguồn tư liệu, hiện ở mọi cảnh có dùng ảnh/video bên ngoài.
export const Credit = ({ credit }: { readonly credit: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!credit) {
    return null;
  }

  return (
    <div
      style={{
        alignSelf: "flex-start",
        padding: "6px 14px",
        borderRadius: 6,
        backgroundColor: "rgba(0,0,0,0.55)",
        fontFamily,
        fontWeight: 600,
        fontSize: 28,
        color: colors.textMuted,
        opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      Nguồn: {credit}
    </div>
  );
};
