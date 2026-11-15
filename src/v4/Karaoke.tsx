import type { Caption } from "@remotion/captions";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, SAFE } from "./theme";

// Phụ đề karaoke: hiện cả cụm câu, chữ đang được đọc sáng vàng.
export const Karaoke = ({ words }: { readonly words: Caption[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = (frame / fps) * 1000;

  // Chia thành các trang theo pageBreakAfter.
  const pages: Caption[][] = [[]];
  for (const w of words) {
    pages[pages.length - 1].push(w);
    if (w.pageBreakAfter) pages.push([]);
  }
  const page =
    [...pages].reverse().find((p) => p.length && p[0].startMs - 30 <= now) ??
    pages[0];
  const last = page[page.length - 1];
  if (!last || now > last.endMs + 1500) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.right,
        bottom: SAFE.bottom + 30,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "14px 26px",
          borderRadius: 18,
          backgroundColor: "rgba(28,30,34,0.82)",
          fontFamily,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.25,
          textAlign: "center",
          textWrap: "balance",
          color: "#fff",
        }}
      >
        {page.map((w, i) => {
          const active =
            now >= w.startMs - 40 &&
            now < (page[i + 1]?.startMs ?? w.endMs + 400);
          return (
            <span key={i} style={{ color: active ? "#ffd21f" : "#fff" }}>
              {w.text}
              {i < page.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
