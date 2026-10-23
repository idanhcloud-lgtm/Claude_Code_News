"""Chuyển ảnh thời sự thành nét phác thảo vector để Remotion "vẽ tay" lại.

Dùng:
  .venv-tts/bin/python scripts/make-sketch.py <ảnh-vào> <ra.json> [--preview ra.png] [--detail 1.0]

Ra JSON: {"width", "height", "totalLength", "paths": [{"d", "length"}]} — toạ độ theo ảnh đã thu về
rộng 1600px. Thứ tự nét: các nét dài (đường viền chính) trước, rồi các nét chi tiết từ trên xuống dưới,
giống cách người vẽ phác hình trước khi thêm chi tiết.
--detail > 1 giữ nhiều chi tiết hơn (nét ngắn hơn, nhiều nét hơn); < 1 thì gọn hơn.
"""

import argparse
import json

import cv2
import numpy as np

WIDTH = 1600
MAX_PATHS = 900


def edge_map(img, detail):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Làm mịn giữ cạnh để bỏ nhiễu nền (lá cây, sỏi đá) nhưng giữ đường viền người, vật.
    smooth = cv2.bilateralFilter(gray, 9, 60, 60)
    median = float(np.median(smooth))
    lo = int(max(0, (0.66 / detail) * median))
    hi = int(min(255, (1.33 / detail) * median))
    return cv2.Canny(smooth, lo, hi)


def to_open_line(contour):
    """Contour của nét 1px đi ra rồi quay về cùng một đường — chỉ giữ nửa đầu để vẽ một lần."""
    pts = contour.reshape(-1, 2)
    if cv2.contourArea(contour) < 0.05 * cv2.arcLength(contour, True):
        far = int(np.argmax(np.linalg.norm(pts - pts[0], axis=1)))
        pts = pts[: max(2, far + 1)]
    return pts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("image")
    parser.add_argument("out")
    parser.add_argument("--preview")
    parser.add_argument("--detail", type=float, default=1.0)
    args = parser.parse_args()

    img = cv2.imread(args.image)
    h, w = img.shape[:2]
    img = cv2.resize(img, (WIDTH, round(h * WIDTH / w)), interpolation=cv2.INTER_AREA)
    height = img.shape[0]

    edges = edge_map(img, args.detail)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)

    min_len = 30 / args.detail
    lines = []
    for c in contours:
        pts = to_open_line(c)
        if len(pts) < 2:
            continue
        pts = cv2.approxPolyDP(pts.reshape(-1, 1, 2).astype(np.int32), 1.2, False).reshape(-1, 2)
        length = float(np.sum(np.linalg.norm(np.diff(pts, axis=0), axis=1)))
        if length >= min_len:
            lines.append((length, pts))

    lines.sort(key=lambda x: -x[0])
    lines = lines[:MAX_PATHS]
    # Nét dài (khung hình) trước, sau đó chi tiết theo dải ngang từ trên xuống.
    n_outline = max(1, len(lines) // 7)
    outline, detail = lines[:n_outline], lines[n_outline:]
    band = height / 8
    detail.sort(key=lambda x: (int(x[1][:, 1].mean() // band), x[1][:, 0].mean()))

    paths = []
    for length, pts in outline + detail:
        d = "M" + " L".join(f"{x} {y}" for x, y in pts.tolist())
        paths.append({"d": d, "length": round(length, 1)})

    data = {
        "width": WIDTH,
        "height": height,
        "totalLength": round(sum(p["length"] for p in paths), 1),
        "paths": paths,
    }
    with open(args.out, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"{len(paths)} nét, tổng dài {data['totalLength']:.0f}px")

    if args.preview:
        canvas = np.full((height, WIDTH, 3), 245, np.uint8)
        for _, pts in outline + detail:
            cv2.polylines(canvas, [pts.reshape(-1, 1, 2).astype(np.int32)], False, (40, 40, 40), 2, cv2.LINE_AA)
        cv2.imwrite(args.preview, canvas)


if __name__ == "__main__":
    main()
