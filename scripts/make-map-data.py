"""Tạo dữ liệu bản đồ vector cho mẫu Explainer (src/v3) từ Natural Earth (public domain).

Dùng:
  python3 scripts/make-map-data.py <ne_50m_admin_0_countries.geojson> <ne_10m_admin_0_countries.geojson> <ra.json>
     [--bbox 90,-5,130,28] [--detail VNM]

Ra JSON: [{"iso", "name", "d"}] — đường SVG đã chiếu Web Mercator ở zoom 0 (thế giới = 256×256),
nên phía Remotion chỉ cần scale/translate theo camera. Nước trong --detail lấy bản 10m (bờ biển chi tiết
để zoom sát), các nước khác lấy bản 50m cho nhẹ.
"""

import argparse
import json
import math


def project(lon, lat):
    x = (lon + 180) / 360 * 256
    s = math.sin(math.radians(max(-85, min(85, lat))))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * 256
    return x, y


def ring_to_d(ring):
    pts = [project(lon, lat) for lon, lat in ring]
    out, last = [], None
    for x, y in pts:
        p = (round(x, 4), round(y, 4))
        if p != last:
            out.append(p)
            last = p
    if len(out) < 3:
        return ""
    return "M" + "L".join(f"{x} {y}" for x, y in out) + "Z"


def polygons(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def in_bbox(geom, bbox):
    w, s, e, n = bbox
    for poly in polygons(geom):
        for lon, lat in poly[0]:
            if w <= lon <= e and s <= lat <= n:
                return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ne50")
    ap.add_argument("ne10")
    ap.add_argument("out")
    ap.add_argument("--bbox", default="90,-5,130,28")
    ap.add_argument("--detail", default="VNM")
    args = ap.parse_args()
    bbox = [float(v) for v in args.bbox.split(",")]
    detail = set(args.detail.split(","))

    def load(path):
        return json.load(open(path, encoding="utf-8"))["features"]

    feats = {}
    for f in load(args.ne50):
        iso = f["properties"].get("ADM0_A3")
        if iso not in detail and in_bbox(f["geometry"], bbox):
            feats[iso] = f
    for f in load(args.ne10):
        iso = f["properties"].get("ADM0_A3")
        if iso in detail:
            feats[iso] = f

    out = []
    for iso, f in feats.items():
        d = "".join(ring_to_d(ring) for poly in polygons(f["geometry"]) for ring in poly[:1])
        out.append({"iso": iso, "name": f["properties"].get("NAME", iso), "d": d})
    json.dump(out, open(args.out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(out)} nước, {sum(len(o['d']) for o in out) // 1024} KB")


if __name__ == "__main__":
    main()
