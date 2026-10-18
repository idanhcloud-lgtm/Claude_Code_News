# Claude Code News — video tin tức dọc bằng Remotion

Dự án tạo video tin tức **dọc 9:16 (1080×1920, 30fps)** cho TikTok / Reels / Shorts bằng Remotion 4.

## Skills Remotion

Bộ skill chính thức của Remotion nằm trong `.claude/skills/` (khoá phiên bản trong `skills-lock.json`).
Trước khi viết hoặc sửa code Remotion, luôn tải skill `remotion-best-practices` (router), rồi skill con phù hợp
(`remotion-markup` cho animation, `remotion-captions` cho phụ đề, `remotion-render` khi xuất video).
Cập nhật Remotion + skills: dùng skill `remotion-upgrade` (giữ mọi gói `@remotion/*` cùng một phiên bản, không dùng `^`).

## Cấu trúc

- `src/Root.tsx` — đăng ký composition `NewsVertical` (video chính) và các scene/element dạng connected composition.
- `src/NewsVideo.tsx` — ghép Intro → các tin → Outro bằng `TransitionSeries`; TopBar + Ticker trên `Track` "Overlays".
  Thời lượng tự tính trong `calculateNewsMetadata` từ `durationInSeconds` của từng tin.
- `src/schema.ts` — schema zod cho props (sửa được trong Studio, hoặc truyền `--props=news.json` khi render).
- `src/scenes/` — `IntroScene`, `StoryScene`, `OutroScene`. `src/elements/` — `TopBar`, `Ticker`, `Background`, `SafeZoneGuide`.
- `src/theme.ts` — màu, font, kích thước video, **vùng an toàn `SAFE`**, thời lượng chuyển cảnh.
- `public/fonts/` — font Be Vietnam Pro đóng gói sẵn (offline). `public/images/` — ảnh cho từng tin.

## Quy tắc bắt buộc

1. **Vùng an toàn TikTok** (`SAFE` trong `src/theme.ts`): không đặt chữ/chi tiết quan trọng trong
   - trên 260px: thanh tìm kiếm, tab "Đã follow · Dành cho bạn", LIVE;
   - dưới 480px: tên kênh, phần mô tả (caption), nhạc, thanh điều hướng;
   - phải 160px: cột avatar / tim / bình luận / lưu / chia sẻ.
   Luôn định vị theo `SAFE`, không hardcode toạ độ mép. Bật `showSafeZone` trong Studio để xem (không xuất hiện khi render).
2. Mọi animation dùng `useCurrentFrame()` + `interpolate()` / `spring()`. **Không** dùng CSS transition/animation hay class animation của Tailwind (không render được, gây giật).
3. Đổi giây sang frame qua `fps` từ `useVideoConfig()`; dùng `scale` / `translate` / `rotate` thay cho `transform`.
4. Cỡ chữ tối thiểu ở khung 1080px: tiêu đề ≥ 84px, chữ phụ quan trọng ≥ 44px. Tiêu đề tin nên ≤ 2–3 dòng.
5. Chữ tiếng Việt dùng `fontFamily` từ `src/theme.ts` (Be Vietnam Pro, weight 400/600/800).
6. Ảnh dùng `<Img>` của `remotion`; video/âm thanh dùng `@remotion/media` (`<Video>`, `<Audio>`) để render mượt, không mất khung.

## Quy trình làm một bản tin

1. Copy `news.example.json` → `news.json`, điền tin (ảnh đặt trong `public/images/`, ghi `"image": "images/ten-anh.jpg"`, hoặc URL).
2. Xem trước: `npm run dev` (Remotion Studio). Chỉ render khi người dùng yêu cầu rõ ràng.
3. Render: `npm run render:props` → `out/ban-tin.mp4`. Thumbnail: `npm run still`.
4. Kiểm tra: `npm run lint` (eslint + tsc) phải sạch.

Cấu hình chất lượng xuất ở `remotion.config.ts`: H.264, CRF 16, preset slow, yuv420p, BT.709, JPEG 95.
Trên cloud, hook `.claude/hooks/session-start.sh` tự `npm install` và đặt `REMOTION_BROWSER_EXECUTABLE`.
