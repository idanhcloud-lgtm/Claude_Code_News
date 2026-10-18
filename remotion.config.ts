/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Chất lượng xuất video cho TikTok / Reels / Shorts:
// H.264 + yuv420p tương thích mọi nền tảng, màu chuẩn BT.709.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioBitrate("320k");
Config.setEntryPoint("src/index.ts");

// Cho phép chỉ định Chromium có sẵn (vd: môi trường cloud) qua biến môi trường.
// Trên máy cá nhân để trống: Remotion tự tải Chrome Headless Shell.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
