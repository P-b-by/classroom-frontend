#!/usr/bin/env python3
"""Generate smooth, high-resolution logo variants from logo.png."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "public"
SRC = ROOT / "logo.png"
OUT_DARK = ROOT / "logo-on-dark.png"
OUT_LIGHT = ROOT / "logo-on-light.png"
TARGET = 1000

GOLD = (201, 169, 98, 255)
IVORY = (247, 245, 240, 255)
BLACK = (10, 10, 10, 255)


def is_gold(r: int, g: int, b: int, a: int) -> bool:
    if a < 40:
        return False
    return r > 115 and g > 85 and b < 145 and r > b and g > b * 0.65


def upscale(img: Image.Image) -> Image.Image:
    w, h = img.size
    scale = TARGET / max(w, h)
    if scale <= 1.05:
        return img.convert("RGBA")
    nw, nh = int(w * scale), int(h * scale)
    return img.resize((nw, nh), Image.Resampling.LANCZOS)


def smooth_alpha(img: Image.Image) -> Image.Image:
    """Soften jagged edges on alpha channel."""
    r, g, b, a = img.split()
    a_smooth = a.filter(ImageFilter.GaussianBlur(radius=0.8))
    return Image.merge("RGBA", (r, g, b, a_smooth))


def flood_transparent(px, src_px, w: int, h: int) -> None:
    visited = [[False] * w for _ in range(h)]
    for seed in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        q = deque([seed])
        while q:
            x, y = q.popleft()
            if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
                continue
            visited[y][x] = True
            sr, sg, sb, sa = src_px[x, y]
            if sa < 25 or (sr < 55 and sg < 55 and sb < 55 and not is_gold(sr, sg, sb, sa)):
                px[x, y] = (0, 0, 0, 0)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    q.append((nx, ny))


def build_light(src: Image.Image) -> Image.Image:
    w, h = src.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    spx = src.load()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = spx[x, y]
            if a < 25:
                opx[x, y] = (0, 0, 0, 0)
            elif is_gold(r, g, b, a):
                opx[x, y] = GOLD
            elif r < 110 and g < 110 and b < 110:
                opx[x, y] = BLACK
            else:
                opx[x, y] = (r, g, b, a)
    flood_transparent(opx, spx, w, h)
    return smooth_alpha(out)


def build_dark(src: Image.Image) -> Image.Image:
    w, h = src.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    spx = src.load()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = spx[x, y]
            if a < 25:
                opx[x, y] = (0, 0, 0, 0)
            elif is_gold(r, g, b, a):
                opx[x, y] = GOLD
            elif r < 110 and g < 110 and b < 110:
                opx[x, y] = IVORY
            else:
                opx[x, y] = (min(255, r + 200), min(255, g + 195), min(255, b + 190), a)
    flood_transparent(opx, spx, w, h)
    return smooth_alpha(out)


def main() -> None:
    src = upscale(Image.open(SRC))
    light = build_light(src)
    dark = build_dark(src)
    light.save(OUT_LIGHT, "PNG", optimize=True)
    dark.save(OUT_DARK, "PNG", optimize=True)
    print(f"Saved {OUT_LIGHT.name} and {OUT_DARK.name} at {light.size[0]}x{light.size[1]}")


if __name__ == "__main__":
    main()
