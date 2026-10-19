# Claude Code News — video tin tức dọc bằng Remotion

Dự án tạo video tin tức **dọc 9:16 (1080×1920, 30fps)** cho TikTok / Reels / Shorts bằng Remotion 4.

**Tên kênh: "TIN NHANH 1 PHÚT"**: luôn đặt `showName` = `"TIN NHANH 1 PHÚT"`. Thanh trên chỉ hiện tên kênh + ngày;
không dùng các chữ "TIN NÓNG", "TRỰC TIẾP" trong layout.

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
- `src/NewsStory60.tsx` — mẫu 1 tin ~60 giây `TinNong60s`: Hook → các cảnh tư liệu (`ShotScene`) → Outro, kèm thanh tiến độ.
- `episodes/` — kịch bản (props JSON) của từng video đã làm. `scripts/prepare-media.sh` — chuẩn hoá tư liệu.
- `public/fonts/` — font Be Vietnam Pro đóng gói sẵn (offline). `public/images/`, `public/media/` — ảnh/video tư liệu.

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
6. Không đặt tên prop của component tạo bằng `Interactive.create()` trùng tên dành riêng của Remotion
   (`from`, `durationInFrames`, `style`, `cropLeft/Right/Top/Bottom`, `width`, `height`, …) — TypeScript sẽ báo lỗi.
7. Ảnh dùng `<Img>` của `remotion`; video/âm thanh dùng `@remotion/media` (`<Video>`, `<Audio>`) để render mượt, không mất khung.

## Quy trình: người dùng gửi link 1 tin → video 60 giây (`TinNong60s`)

1. **Đọc bài** bằng `curl` (đặt User-Agent trình duyệt) và lấy: tiêu đề, sapo, các đoạn, chú thích ảnh/video, ngày đăng.
2. **Tìm tư liệu, ưu tiên theo thứ tự:**
   1. Nguồn gốc của tư liệu: website, press kit, thư mục Google Drive báo chí của công ty/cơ quan trong tin.
      Thư mục Drive công khai liệt kê được qua `https://drive.google.com/embeddedfolderview?id=<ID>`, tải file qua
      `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`.
   2. Ảnh/video công khai trên chính bài báo (`og:image`, ảnh trong bài).
   3. Wikimedia Commons, Pexels, Pixabay cho cảnh minh họa.
   **Không** giải mã hay vượt qua cơ chế bảo vệ (vd: HLS mã hoá AES, DRM). Gặp thì tìm bản gốc từ nguồn khác.
3. **Chuẩn bị tư liệu:** tải vào thư mục tạm, chạy `scripts/prepare-media.sh <tạm> public/media/<chủ-đề>`
   (về 1920px, 30fps). `public/media/` không đưa lên git.
4. **Xem nội dung** từng video (ghép khung hình bằng ffmpeg) để chọn đoạn có chủ thể rõ: đặt `trimBeforeSeconds`
   và đảm bảo `trimBeforeSeconds + durationInSeconds` không vượt độ dài clip.
5. **Viết kịch bản** vào `episodes/<ngày>-<chủ-đề>.json` (schema `story60Schema` trong `src/schema.ts`):
   hook 3s (tiêu đề ≤ ~45 ký tự) + 6–8 cảnh, mỗi cảnh một ý ≤ ~75 ký tự, chỉ dùng thông tin có trong bài.
   Muốn đúng 60s: tổng `durationInSeconds` các cảnh ≈ 54 + 0,25 × (số cảnh + 1).
   Tư liệu ngang dùng `"fit": "frame"`; ảnh/video dọc dùng `"cover"`.
   Video nguồn có phụ đề/chữ in sẵn ở mép dưới: đặt `"cutBottom": 0.15–0.25` để cắt bỏ; tránh các đoạn có tiêu đề in giữa khung.
   Video ngắn hơn (vd 30s): tổng cảnh ≈ (thời lượng − 6) + 0,27 × (số cảnh + 1).
6. **Giọng đọc (mặc định có):** giọng **"Minh Triết"** (nam, giọng Nam, phong cách tin tức) của VieNeu-TTS — offline, miễn phí.
   - Cài một lần: `python3 -m venv .venv-tts && .venv-tts/bin/pip install -r scripts/requirements-tts.txt`.
   - Viết `hookNarration` và `narration` cho từng cảnh (1–2 câu, giọng văn nói). Số/ngày/đơn vị viết dạng
     `[hiển thị|đọc]`, vd `[28/10|hai mươi tám tháng mười]`, `[15°C|mười lăm độ C]`.
   - Chạy `.venv-tts/bin/python scripts/make-voiceover.py episodes/<tập>.json` → tự tạo `voice`, `captions`
     (phụ đề chạy theo từng cụm lời) và đặt lại `durationInSeconds` theo giọng đọc. Có phụ đề thì cảnh hiện phụ đề thay cho `text`.
   - Nhạc nền khi có giọng đọc: `musicVolume` ≈ 0.2.
   - Ảnh/video bị cắt mất chủ thể (vd đầu người): đặt `focusY` (0 = giữ phần trên, 1 = phần dưới).
7. **Nhạc nền:** `python3 scripts/make-tension-music.py <giây> <ra.wav> [bpm] [tension|upbeat]` tự soạn nhạc
   (không bản quyền): `tension` cho tin nóng/biểu tình, `upbeat` (bpm ~118) cho thể thao/tin vui. Độ dài = thời lượng
   video (xem bằng `npx remotion compositions --props=<tập>`). Đổi sang `.m4a` bằng ffmpeg, đặt vào
   `public/media/<tập>/` và trường `music`.
8. **Ghi nguồn** ở mọi cảnh: `credit` = chủ sở hữu tư liệu ("Video: …", "Ảnh: …"); `hookCredit` thêm báo gốc ("Tin: VnExpress").
9. **Kiểm tra trước khi render cả video:** `npx remotion render TinNong60s out/check --frames=... --sequence --image-format=jpeg --props=<file>`
   rồi xem các khung hình. Sau đó: `npm run render:60s -- out/<tên>.mp4 --props=<file>`.
10. **Chuẩn hoá âm lượng cho TikTok** (khoảng −14 LUFS) sau khi render, giữ nguyên hình:
    `ffmpeg -i out/<tên>.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k out/<tên>-final.mp4`.

## Quy trình làm một bản tin nhiều tin (`NewsVertical`)

1. Copy `news.example.json` → `news.json`, điền tin (ảnh đặt trong `public/images/`, ghi `"image": "images/ten-anh.jpg"`, hoặc URL).
2. Xem trước: `npm run dev` (Remotion Studio). Chỉ render khi người dùng yêu cầu rõ ràng.
3. Render: `npm run render:props` → `out/ban-tin.mp4`. Thumbnail: `npm run still`.
4. Kiểm tra: `npm run lint` (eslint + tsc) phải sạch.

Cấu hình chất lượng xuất ở `remotion.config.ts`: H.264, CRF 16, preset slow, yuv420p, BT.709, JPEG 95.
Trên cloud, hook `.claude/hooks/session-start.sh` tự `npm install` và đặt `REMOTION_BROWSER_EXECUTABLE`.
