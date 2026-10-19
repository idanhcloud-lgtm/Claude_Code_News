"""Soạn nhạc nền tin tức căng thẳng (không bản quyền) bằng tổng hợp âm thanh.

Dùng: python3 scripts/make-tension-music.py <số-giây> <file-ra.wav> [bpm]
Gồm: tiếng trầm nền (drone), nhịp dây staccato dồn dập, tiếng tích tắc,
trống trầm mỗi ô nhịp, đoạn dâng (riser) và cú nện kết.
"""

import sys
import wave

import numpy as np

SR = 44100


def lowpass(x, cutoff):
    # Bộ lọc thông thấp một cực, đủ để làm mềm sóng răng cưa.
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def saw(freq, t):
    return 2 * ((t * freq) % 1) - 1


def main():
    seconds = float(sys.argv[1])
    out = sys.argv[2]
    bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 100
    beat = 60 / bpm
    n = int(seconds * SR)
    t = np.arange(n) / SR
    mix = np.zeros(n)
    rng = np.random.default_rng(7)

    # Drone: La trầm + Mi, hơi lệch tần để rung, to dần.
    swell = np.clip(t / (seconds * 0.6), 0, 1) * 0.6 + 0.4
    drone = (
        np.sin(2 * np.pi * 55 * t)
        + 0.6 * np.sin(2 * np.pi * 55.4 * t)
        + 0.35 * np.sin(2 * np.pi * 82.4 * t)
    )
    mix += 0.22 * drone * swell

    # Nhịp dây staccato theo móc đơn: La - La - Đô - La - Si giáng (thứ, căng thẳng).
    notes = [110.0, 110.0, 130.81, 110.0, 116.54, 110.0, 130.81, 146.83]
    eighth = beat / 2
    pulse = np.zeros(n)
    k = 0
    start = beat * 2  # vào sau 2 phách
    while start < seconds - 2.5:
        i0 = int(start * SR)
        length = int(0.16 * SR)
        seg_t = np.arange(length) / SR
        env = np.exp(-seg_t / 0.06)
        f = notes[k % len(notes)]
        tone = saw(f, seg_t) + 0.5 * saw(f * 2, seg_t)
        end = min(n, i0 + length)
        pulse[i0:end] += (tone * env)[: end - i0]
        start += eighth
        k += 1
    mix += 0.28 * lowpass(pulse, 1800)

    # Tích tắc theo móc kép.
    tick = np.zeros(n)
    s = beat * 4
    while s < seconds - 2.5:
        i0 = int(s * SR)
        length = int(0.02 * SR)
        burst = rng.standard_normal(length) * np.exp(-np.arange(length) / (0.004 * SR))
        end = min(n, i0 + length)
        tick[i0:end] += burst[: end - i0]
        s += beat / 4
    tick = tick - lowpass(tick, 6000)  # chỉ giữ dải cao
    mix += 0.07 * tick

    # Trống trầm (boom) đầu mỗi ô nhịp 4/4.
    def boom(at, gain):
        i0 = int(at * SR)
        length = int(1.2 * SR)
        bt = np.arange(length) / SR
        freq = 40 + 50 * np.exp(-bt / 0.08)
        phase = 2 * np.pi * np.cumsum(freq) / SR
        b = np.sin(phase) * np.exp(-bt / 0.35)
        end = min(n, i0 + length)
        mix[i0:end] += gain * b[: end - i0]

    bar = beat * 4
    a = 0.0
    while a < seconds - 2.5:
        boom(a, 0.7)
        a += bar

    # Riser: tiếng ồn dâng dần trong 3 giây trước cú nện kết.
    hit_at = seconds - 2.5
    r0, r1 = int((hit_at - 3) * SR), int(hit_at * SR)
    rt = np.linspace(0, 1, r1 - r0)
    riser = rng.standard_normal(r1 - r0) * rt**2
    riser = lowpass(riser, 3000) * 3
    mix[r0:r1] += 0.08 * riser
    boom(hit_at, 1.2)

    # Fade in/out, chuẩn hoá về -1 dBFS.
    fade_in = np.clip(t / 0.4, 0, 1)
    fade_out = np.clip((seconds - t) / 1.5, 0, 1)
    mix *= fade_in * fade_out
    mix = np.tanh(mix * 1.2)
    mix *= 0.89 / np.max(np.abs(mix))

    stereo = np.stack([mix, mix], axis=1)
    data = (stereo * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    main()
