#!/bin/bash
# Chuyển video tư liệu (4K/8K, fps lạ) về bản nhẹ 1920px, 30fps, H.264 để Remotion render mượt.
# Dùng: scripts/prepare-media.sh <thư-mục-chứa-video-gốc> <thư-mục-đích-trong-public/media>
set -euo pipefail

SRC_DIR="$1"
DEST_DIR="$2"
mkdir -p "$DEST_DIR"

for f in "$SRC_DIR"/*.mp4 "$SRC_DIR"/*.mov "$SRC_DIR"/*.webm; do
  [ -e "$f" ] || continue
  name=$(basename "${f%.*}").mp4
  # Xử lý lần lượt từng file: video 8K chạy song song dễ hết RAM.
  ffmpeg -v error -y -i "$f" \
    -vf "scale='min(1920,iw)':-2:flags=lanczos,fps=30" \
    -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -an -threads 4 \
    "$DEST_DIR/$name"
  echo "ok $DEST_DIR/$name"
done

for f in "$SRC_DIR"/*.jpg "$SRC_DIR"/*.jpeg "$SRC_DIR"/*.JPG "$SRC_DIR"/*.JPEG "$SRC_DIR"/*.png; do
  [ -e "$f" ] || continue
  name=$(basename "${f%.*}").jpg
  ffmpeg -v error -y -i "$f" -vf "scale='min(1920,iw)':-2" -q:v 2 "$DEST_DIR/$name"
  echo "ok $DEST_DIR/$name"
done
