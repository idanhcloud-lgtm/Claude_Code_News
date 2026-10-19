"""Tạo giọng đọc + phụ đề cho một tập TinNong60s bằng VieNeu-TTS (offline, miễn phí).

Dùng:
  .venv-tts/bin/python scripts/make-voiceover.py episodes/<tập>.json [--voice "Minh Triết"]

Đọc `hookNarration` và `narration` của từng cảnh, rồi ghi ngược vào file tập:
  - hookVoice / voice: file giọng đọc (public/media/<tập>/vo-*.m4a)
  - captions: phụ đề từng cụm câu, thời gian chính xác vì mỗi cụm được đọc riêng
  - hookDurationInSeconds / durationInSeconds: khớp độ dài giọng đọc

Cú pháp lời đọc: [hiển thị|đọc] để phụ đề hiện một kiểu, giọng đọc một kiểu,
vd "[28/10|hai mươi tám tháng mười]". Số nên viết bằng chữ trong phần đọc.
"""

import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
LEAD_IN = 0.25  # im lặng đầu cảnh, để giọng vào sau hiệu ứng chuyển cảnh
TAIL = 0.45  # im lặng cuối cảnh, tránh giọng chồng lên cảnh sau
GAP_COMMA = 0.12
GAP_SENTENCE = 0.3
MARKUP = re.compile(r"\[([^|\]]+)\|([^\]]+)\]")


def split_chunks(narration):
    """Tách lời đọc thành các cụm theo dấu câu; gộp cụm quá ngắn (< 4 từ)."""
    parts = re.findall(r"[^,.;:!?]+[,.;:!?]*", narration)
    chunks = []
    for p in (x.strip() for x in parts):
        if not p:
            continue
        if chunks and len(MARKUP.sub(r"\2", chunks[-1]).split()) < 4:
            chunks[-1] = f"{chunks[-1]} {p}"
        else:
            chunks.append(p)
    return chunks


def trim_silence(audio, threshold=0.01):
    loud = np.where(np.abs(audio) > threshold)[0]
    if len(loud) == 0:
        return audio
    start = max(0, loud[0] - int(0.03 * SR))
    end = min(len(audio), loud[-1] + int(0.06 * SR))
    return audio[start:end]


def synth(tts, voice, narration):
    """Trả về (audio, captions) với captions theo định dạng Caption của Remotion."""
    pieces = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
    captions = []
    t = LEAD_IN
    for chunk in split_chunks(narration):
        spoken = MARKUP.sub(r"\2", chunk)
        shown = MARKUP.sub(r"\1", chunk).rstrip(",;:")
        audio = trim_silence(np.asarray(tts.infer(spoken, voice=voice), dtype=np.float32))
        dur = len(audio) / SR
        captions.append(
            {
                "text": shown,
                "startMs": round(t * 1000),
                "endMs": round((t + dur) * 1000),
                "timestampMs": None,
                "confidence": None,
            }
        )
        gap = GAP_SENTENCE if chunk.rstrip()[-1:] in ".!?" else GAP_COMMA
        pieces += [audio, np.zeros(int(gap * SR), dtype=np.float32)]
        t += dur + gap
    out = np.concatenate(pieces)
    peak = np.max(np.abs(out))
    if peak > 0:
        out *= 0.89 / peak  # chuẩn hoá đỉnh về -1 dBFS, tránh vỡ tiếng
    return out, captions


def write_m4a(audio, path):
    wav = path.with_suffix(".wav")
    sf.write(wav, audio, SR)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "192k", str(path)],
        check=True,
    )
    wav.unlink()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("episode")
    parser.add_argument("--voice", default="Minh Triết")
    args = parser.parse_args()

    from vieneu import Vieneu

    episode_path = Path(args.episode)
    ep = json.loads(episode_path.read_text(encoding="utf-8"))
    out_dir = Path("public/media") / episode_path.stem
    out_dir.mkdir(parents=True, exist_ok=True)
    tts = Vieneu()

    if ep.get("hookNarration"):
        audio, _ = synth(tts, args.voice, ep["hookNarration"])
        write_m4a(audio, out_dir / "vo-hook.m4a")
        ep["hookVoice"] = f"media/{episode_path.stem}/vo-hook.m4a"
        ep["hookDurationInSeconds"] = round(min(10, max(2, len(audio) / SR + TAIL)), 2)
        print(f"hook: {ep['hookDurationInSeconds']}s")

    for i, shot in enumerate(ep["shots"], start=1):
        if not shot.get("narration"):
            continue
        audio, captions = synth(tts, args.voice, shot["narration"])
        write_m4a(audio, out_dir / f"vo-{i}.m4a")
        shot["voice"] = f"media/{episode_path.stem}/vo-{i}.m4a"
        shot["captions"] = captions
        shot["durationInSeconds"] = round(min(20, max(2, len(audio) / SR + TAIL)), 2)
        print(f"cảnh {i}: {shot['durationInSeconds']}s, {len(captions)} cụm phụ đề")

    episode_path.write_text(json.dumps(ep, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = (ep.get("hookDurationInSeconds") or 3) + sum(s["durationInSeconds"] for s in ep["shots"]) + 3
    print(f"Tổng ước tính: {total - (len(ep['shots']) + 1) * 0.27:.1f}s")


if __name__ == "__main__":
    main()
