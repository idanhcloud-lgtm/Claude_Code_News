import { staticFile } from "remotion";

// URL giữ nguyên; đường dẫn khác coi là file trong public/.
export const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

export const isVideo = (src: string) =>
  /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(src);
