#!/usr/bin/env python3
"""
Cut dedicated customer-facing garment card images + the homepage hero strip
from the approved master/study boards.

Outputs:
  public/garments/catsuit.png   (front view, C catsuit master)
  public/garments/singlet.png   (front view, S1 singlet master)
  public/garments/shorts.png    (front view, SH1 shorts master)
  public/references/hero_study_views.png  (views strip, canonical 2-colour study)
"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = os.path.join(ROOT, "data", "references", "garments")
S = os.path.join(ROOT, "data", "references", "studies")
OUT_G = os.path.join(ROOT, "public", "garments")
OUT_R = os.path.join(ROOT, "public", "references")
os.makedirs(OUT_G, exist_ok=True)

# ---- inspect ---------------------------------------------------------------
for p in [
    os.path.join(G, "01_C_Technical_Catsuit_Master.png"),
    os.path.join(G, "02_S1_Technical_Singlet_Master.png"),
    os.path.join(G, "03_SH1_Technical_Shorts_Master.png"),
    os.path.join(S, "05_C_ColourStudy_2Colour_TranslucentBlue_Black_CANONICAL.png"),
]:
    im = Image.open(p)
    print(os.path.basename(p), im.size)

def add_bottom_fade(im, fade_px=150, color=(19, 20, 23)):
    """Dissolve the bottom edge into the card's dark panel colour. The S1/SH1
    source panels fade the legs into a bright haze band - this fades every
    card uniformly to dark instead: clean, coherent, no artefacts."""
    w, h = im.size
    overlay = Image.new("RGB", (w, fade_px), color)
    mask = Image.new("L", (1, fade_px))
    mask.putdata([int(255 * min(1, (y / fade_px) ** 0.8)) for y in range(fade_px)])
    mask = mask.resize((w, fade_px))
    out = im.copy()
    out.paste(overlay, (0, h - fade_px), mask)
    return out


def edge_pad(im, target_w):
    """Pad width to target_w by stretching the outermost pixel columns outward -
    seamless against the smooth studio backdrop."""
    w, h = im.size
    if target_w <= w:
        return im
    pad = target_w - w
    left = pad // 2
    right = pad - left
    out = Image.new("RGB", (target_w, h))
    out.paste(im.crop((0, 0, 1, h)).resize((left, h)), (0, 0))
    out.paste(im, (left, 0))
    out.paste(im.crop((w - 1, 0, w, h)).resize((right, h)), (left + w, 0))
    return out


# ---- garment cards ----------------------------------------------------------
# Card imagery is now supplied as dedicated standalone garment renders in the
# canonical references folder (2:3 portrait, consistent dark backdrop).
CANON = os.path.join(ROOT, "..", "LatexLabs_Dev_Canonical_References")
CARDS = {
    "catsuit.png": "Glossy Black, Red and Yellow Catsuit.png",
    "singlet.png": "Glossy Black, Red and Yellow Singlet.png",
    "shorts.png": "Red Yellow Black Athletic Shorts.png",
}
import shutil
for out, src in CARDS.items():
    shutil.copyfile(os.path.join(CANON, src), os.path.join(OUT_G, out))
    print("wrote", out)

# ---- hero: views strip from the canonical 2-colour study --------------------
# study sheet 1536x1024: views row y~75-875, detail column starts ~x1240.
hero = Image.open(
    os.path.join(S, "05_C_ColourStudy_2Colour_TranslucentBlue_Black_CANONICAL.png")
).crop((0, 62, 1208, 872))
hero.save(os.path.join(OUT_R, "hero_study_views.png"))
print("wrote hero_study_views.png", hero.size)
