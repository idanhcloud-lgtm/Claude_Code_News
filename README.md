# Claude Code News

Mẫu video tin tức **dọc 9:16** cho TikTok / Reels / Shorts, làm bằng [Remotion](https://www.remotion.dev) và điều khiển bằng Claude Code.

- Intro "TIN NÓNG" → từng tin (ảnh nền Ken Burns, tiêu đề hiện từng chữ, tóm tắt, nguồn) → Outro kêu gọi theo dõi
- Thanh "TRỰC TIẾP" phía trên và ticker chạy chữ phía dưới
- Bố cục né vùng giao diện TikTok: thanh tìm kiếm (trên), phần mô tả (dưới), cột nút (phải)
- Font Be Vietnam Pro đóng gói sẵn, hiển thị dấu tiếng Việt chuẩn
- Xuất H.264 CRF 16, yuv420p, BT.709 — sắc nét, tương thích mọi nền tảng
- Bộ skill Remotion chính thức cho Claude Code trong `.claude/skills/`

## Bắt đầu

```bash
npm install
npm run dev            # mở Remotion Studio để xem trước và chỉnh
```

Làm bản tin mới:

```bash
cp news.example.json news.json   # điền tin, ảnh để trong public/images/
npm run render:props             # -> out/ban-tin.mp4
npm run still                    # ảnh thumbnail
```

Hoặc chỉ cần nói với Claude Code, ví dụ: *"Làm bản tin 3 tin công nghệ hôm nay, mỗi tin 7 giây"*.

## Ghi chú

- Lần render đầu tiên Remotion sẽ tự tải Chrome Headless Shell.
- Remotion miễn phí cho cá nhân và nhóm tối đa 3 người; công ty lớn hơn cần [giấy phép](https://www.remotion.pro/license).
- Font Be Vietnam Pro theo giấy phép SIL OFL (`public/fonts/OFL.txt`).
