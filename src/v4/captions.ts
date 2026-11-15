import type { Caption } from "@remotion/captions";

// Phụ đề theo giọng đọc của người dùng (chép bằng Whisper, đã sửa chính tả), thời gian tính từ đầu video.
const c = (text: string, start: number, end: number): Caption => ({
  text,
  startMs: Math.round(start * 1000),
  endMs: Math.round(end * 1000),
  timestampMs: null,
  confidence: null,
});

export const ENGINE_CAPTIONS: Caption[] = [
  c("Exciter 150 hay Winner X?", 0, 2.3),
  c("Cục máy nào ngon hơn?", 2.38, 3.5),
  c("Mổ ra mới thấy khác nhau hoàn toàn.", 3.6, 5.5),
  c("Nhìn lên đầu máy, Exciter dùng 1 trục cam", 5.58, 8.2),
  c("đẩy 4 xupáp qua cò mổ.", 8.3, 10.1),
  c("Winner X dùng tới 2 trục cam,", 10.18, 12.1),
  c("mỗi cam lo riêng 1 cặp xupáp.", 12.2, 14.0),
  c("2 trục cam thì xupáp đóng mở chính xác hơn ở tua cao,", 14.1, 16.8),
  c("nên Winner X đạt công suất cực đại ở 9.000 vòng.", 16.88, 19.8),
  c("Exciter ở 8.500,", 19.9, 21.4),
  c("nhưng nhìn xuống piston.", 21.52, 23.4),
  c("Exciter có hành trình dài hơn,", 23.48, 25.2),
  c("mô-men xoắn nhỉnh hơn, 13,8 so với 13,5.", 25.34, 28.4),
  c("Hộp số: Exciter 5 số, Winner X 6 số.", 28.44, 31.9),
  c("Số 6 giúp chạy đường dài êm hơn, giữ tua thấp hơn.", 32.1, 35.2),
  c("Tóm lại, Exciter kéo lì, Winner X thích ôm tua cao.", 35.32, 38.9),
  c("Anh em phe nào?", 39.0, 39.95),
  c("Gõ 1 cho Exciter, 2 cho Winner X.", 40.06, 42.6),
];
