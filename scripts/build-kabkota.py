"""Download and simplify kabupaten/kota boundaries for the awardee map."""
import json
import math
import time
import urllib.error
import urllib.request
from pathlib import Path

CODES = [
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "21",
    "31", "32", "33", "34", "35", "36", "51", "52", "53",
    "61", "62", "63", "64", "65", "71", "72", "73", "74", "75", "76",
    "81", "82", "91", "92", "93", "94", "95", "96",
]
URL = "https://wilayah-id-api.dhanypedia.com/api/v1/boundaries/regencies?province_code={code}&geometry=true"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "indonesia-kabkota.geojson"
CACHE = ROOT / "scripts" / ".kabkota-cache"


def perp(point, start, end):
    px, py = point
    x1, y1 = start
    x2, y2 = end
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(px - x1, py - y1)
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))


def douglas(points, epsilon):
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    index, distance = 0, 0.0
    for i in range(1, len(points) - 1):
        d = perp(points[i], start, end)
        if d > distance:
            index, distance = i, d
    if distance > epsilon:
        left = douglas(points[: index + 1], epsilon)
        right = douglas(points[index:], epsilon)
        return left[:-1] + right
    return [start, end]


def round_point(point):
    return [round(point[0], 3), round(point[1], 3)]


def simplify_ring(ring, epsilon):
    if len(ring) < 4:
        return [round_point(p) for p in ring]
    closed = ring[0] == ring[-1]
    body = ring[:-1] if closed else ring
    simplified = douglas(body, epsilon)
    if len(simplified) < 3:
        step = max(1, len(body) // 3)
        simplified = body[::step][:3] if len(body) >= 3 else body
    rounded = [round_point(p) for p in simplified]
    deduped = [rounded[0]]
    for point in rounded[1:]:
        if point != deduped[-1]:
            deduped.append(point)
    if len(deduped) < 3:
        deduped = [round_point(p) for p in body[:3]]
    if deduped[0] != deduped[-1]:
        deduped.append(deduped[0])
    return deduped


def ring_span(ring):
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return max(max(xs) - min(xs), max(ys) - min(ys))


def simplify_geometry(geometry):
    kind = geometry["type"]
    coords = geometry["coordinates"]
    if kind == "Polygon":
        return {"type": "Polygon", "coordinates": simplify_polygon(coords)}
    if kind == "MultiPolygon":
        return {
            "type": "MultiPolygon",
            "coordinates": [simplify_polygon(poly) for poly in coords],
        }
    raise ValueError(kind)


def simplify_polygon(rings):
    simplified = []
    for ring in rings:
        span = ring_span(ring)
        epsilon = 0.004 if span < 0.55 else 0.012
        next_ring = simplify_ring(ring, epsilon)
        if len(next_ring) >= 4:
            simplified.append(next_ring)
    return simplified or [[round_point(p) for p in rings[0][:4]]]


def fetch(code):
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f"{code}.json"
    if cached.exists() and cached.stat().st_size > 100:
        return json.loads(cached.read_text(encoding="utf-8"))
    request = urllib.request.Request(
        URL.format(code=code),
        headers={"User-Agent": "aksara-map-build"},
    )
    delay = 16
    for attempt in range(6):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                payload = json.load(response)
            cached.write_text(json.dumps(payload), encoding="utf-8")
            return payload
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 5:
                raise
            print(f"{code} rate limited, wait {delay}s", flush=True)
            time.sleep(delay)
            delay += 8
    raise RuntimeError(code)


def main():
    features = []
    for index, code in enumerate(CODES):
        payload = fetch(code)
        incoming = payload["features"]
        print(f"{code} {len(incoming)}", flush=True)
        for feature in incoming:
            props = feature["properties"]
            tipe = str(props.get("tipe") or "").lower()
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "kode": str(props["kode_kab"]),
                        "prov": str(props["kode_prov"]),
                        "nama": props["nama_kabupaten"],
                        "provinsi": props["nama_provinsi"],
                        "tipe": "kota" if "kota" in tipe else "kabupaten",
                    },
                    "geometry": simplify_geometry(feature["geometry"]),
                }
            )

    collection = {"type": "FeatureCollection", "features": features}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(collection, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    names = sorted({f["properties"]["provinsi"] for f in features})
    print("features", len(features))
    print("bytes", OUT.stat().st_size)
    print("provinces", len(names))
    for name in names:
        print("-", name)


if __name__ == "__main__":
    main()
