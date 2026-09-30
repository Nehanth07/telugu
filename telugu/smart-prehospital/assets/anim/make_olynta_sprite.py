#!/usr/bin/env python3
"""
Generate an "Olynta" mask film-strip where each letter is DRAWN like handwriting
(the Generous Branding feel): ink flows from the top of each letter through its
strokes, and letters build left -> right, as if a person is writing them.

Instead of flying pixel blocks, every letter is revealed ALONG ITS OWN STROKE
PATH using a geodesic flood:

  1. Render "Olynta" (Anton) -> alpha silhouette.
  2. Label connected components (= individual letters).
  3. For each letter, pick a pen-start pixel at the TOP of the letter, then
     compute the geodesic distance (distance measured *through the ink*, not
     straight-line) from that start to every other pixel of the letter.
     Normalizing that distance gives u(x,y) in [0,1] = "when the pen reaches
     this pixel." Because it travels through the strokes, curves reveal as arcs
     and stems reveal end-to-end -> it looks written, not wiped.
  4. Stagger letters left -> right (with overlap) across the timeline.
  5. For each of FRAMES frames, a pixel is inked once the pen has passed it,
     with a soft leading edge so the stroke tip looks like flowing ink.
  6. Stack all frames vertically -> one PNG whose ALPHA is the CSS mask.

Output: assets/anim/olynta-sprite.png  (FW x FH*FRAMES, RGBA)
CSS reveals a solid ink block through it via
    mask: url(sprite) 0 0 / 100% auto no-repeat;
    transition: mask 1.6s steps(FRAMES-1);   (mask-position 0 0 -> 0 100%)
"""
import os
import math
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---- config ---------------------------------------------------------------
HERE      = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = os.path.join(HERE, "Anton.ttf")
OUT_PATH  = os.path.join(HERE, "olynta-sprite.png")

WORD    = "Olynta"
FRAMES  = 50                 # matches reference (steps(49) -> 50 frames)
FW      = 900                # frame width  (px)
FH      = 260                # frame height (px)
INK     = (11, 15, 20)       # #0b0f14 (revealed colour; alpha carries the mask)

LETTER_DUR = 0.46            # how long ONE letter takes to draw (normalized time)
EDGE       = 0.10            # soft leading-edge width of the flowing ink (norm time)
THRESH     = 128             # alpha cutoff used to define "ink" for the flood
SUPERSAMPLE = 3              # render hi-res then downscale for crisp edges
# --------------------------------------------------------------------------


def render_word_alpha(w, h):
    """Render WORD centered; return uint8 alpha array (H x W), >0 = ink."""
    ss = SUPERSAMPLE
    big = Image.new("L", (w * ss, h * ss), 0)
    d = ImageDraw.Draw(big)
    margin_x = int(w * ss * 0.05)
    margin_y = int(h * ss * 0.16)
    target_w = w * ss - 2 * margin_x
    target_h = h * ss - 2 * margin_y

    size = 10
    font = ImageFont.truetype(FONT_PATH, size)
    while True:
        nxt = ImageFont.truetype(FONT_PATH, size + 4)
        bb = d.textbbox((0, 0), WORD, font=nxt)
        if (bb[2] - bb[0]) > target_w or (bb[3] - bb[1]) > target_h:
            break
        size += 4
        font = nxt
        if size > h * ss:
            break

    bb = d.textbbox((0, 0), WORD, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x = (w * ss - tw) / 2 - bb[0]
    y = (h * ss - th) / 2 - bb[1]
    d.text((x, y), WORD, font=font, fill=255)
    small = big.resize((w, h), Image.LANCZOS)
    return np.asarray(small, dtype=np.uint8)


def label_components(mask):
    """4/8-connected component labelling. mask: bool HxW. Returns (labels, n)."""
    H, W = mask.shape
    labels = np.zeros((H, W), dtype=np.int32)
    n = 0
    # 8-connectivity
    nbrs = [(-1, -1), (-1, 0), (-1, 1), (0, -1),
            (0, 1), (1, -1), (1, 0), (1, 1)]
    for sy in range(H):
        for sx in range(W):
            if mask[sy, sx] and labels[sy, sx] == 0:
                n += 1
                q = deque([(sy, sx)])
                labels[sy, sx] = n
                while q:
                    cy, cx = q.popleft()
                    for dy, dx in nbrs:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and labels[ny, nx] == 0:
                            labels[ny, nx] = n
                            q.append((ny, nx))
    return labels, n


def geodesic_from_top(mask):
    """
    BFS geodesic distance (through-ink) from a pen-start at the TOP of the
    component. mask: bool HxW for ONE letter. Returns float dist array
    normalized to [0,1] on ink pixels, -1 elsewhere.
    """
    H, W = mask.shape
    ys, xs = np.where(mask)
    if len(ys) == 0:
        return np.full((H, W), -1.0)

    top = ys.min()
    # pen start = ink pixels within the top few rows, take their centroid x,
    # then the actual top-row ink pixel closest to that centroid.
    band = ys <= top + max(1, int(0.06 * (ys.max() - top + 1)))
    cx = int(round(xs[band].mean()))
    top_row_xs = xs[ys == top]
    start_x = int(top_row_xs[np.argmin(np.abs(top_row_xs - cx))])
    start = (int(top), start_x)

    dist = np.full((H, W), -1.0)
    dist[start] = 0.0
    q = deque([start])
    nbrs = [(-1, -1, 1.4142), (-1, 0, 1.0), (-1, 1, 1.4142), (0, -1, 1.0),
            (0, 1, 1.0), (1, -1, 1.4142), (1, 0, 1.0), (1, 1, 1.4142)]
    # 0-1 BFS-ish: use a simple Dijkstra with deque is not exact; use plain BFS
    # in ring order but accumulate diagonal cost -> good enough for ordering.
    while q:
        cy, cx2 = q.popleft()
        base = dist[cy, cx2]
        for dy, dx, cost in nbrs:
            ny, nx = cy + dy, cx2 + dx
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx]:
                nd = base + cost
                if dist[ny, nx] < 0 or nd < dist[ny, nx]:
                    dist[ny, nx] = nd
                    q.append((ny, nx))

    d = dist[mask]
    dmax = d.max() if d.max() > 0 else 1.0
    out = np.full((H, W), -1.0)
    out[mask] = dist[mask] / dmax
    return out


def main():
    alpha = render_word_alpha(FW, FH)            # uint8 HxW
    ink = alpha >= THRESH
    labels, n = label_components(ink)
    print("letters (components) found:", n)

    # order components left -> right by centroid x
    comps = []
    for lab in range(1, n + 1):
        m = labels == lab
        xs = np.where(m)[1]
        if len(xs) < 20:        # ignore tiny specks
            continue
        comps.append((xs.mean(), m))
    comps.sort(key=lambda c: c[0])
    N = len(comps)
    print("letters used:", N)

    # per-pixel reveal time in [0,1]
    reveal = np.full((FH, FW), 2.0)              # 2.0 = never (safety)
    for i, (_, m) in enumerate(comps):
        u = geodesic_from_top(m)                 # [0,1] on this letter
        start_i = (i / max(1, N - 1)) * (1.0 - LETTER_DUR)  # stagger L->R
        t_letter = start_i + u * LETTER_DUR
        sel = m & (u >= 0)
        reveal[sel] = t_letter[sel]

    af = alpha.astype(np.float32) / 255.0        # antialiased letter alpha

    strip = Image.new("RGBA", (FW, FH * FRAMES), (0, 0, 0, 0))
    ink_rgb = np.zeros((FH, FW, 3), dtype=np.uint8)
    ink_rgb[..., 0] = INK[0]; ink_rgb[..., 1] = INK[1]; ink_rgb[..., 2] = INK[2]

    for f in range(FRAMES):
        t = f / (FRAMES - 1)
        # how far past the pen tip each pixel is, ramped over EDGE
        prog = (t - reveal) / EDGE
        prog = np.clip(prog, 0.0, 1.0)
        a = (prog * af * 255.0).astype(np.uint8)
        frame = np.dstack([ink_rgb, a])
        strip.paste(Image.fromarray(frame, "RGBA"), (0, f * FH))

    strip.save(OUT_PATH)
    print("wrote", OUT_PATH, strip.size, "| frame", (FW, FH), "| frames", FRAMES)


if __name__ == "__main__":
    main()
