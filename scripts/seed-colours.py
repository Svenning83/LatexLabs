#!/usr/bin/env python3
"""
Seed the Libidex colour database.

Generates:
  data/colours/libidex.json   - colour records (spec schema + swatch_hex)
  public/swatches/<id>.png    - locally cached swatch tiles (stdlib PNG writer)

Colour names preserved exactly as Libidex presents them to customers
(collected from the Libidex product configurator colour dropdown).
"""
import json
import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "colours", "libidex.json")
SWATCH_DIR = os.path.join(ROOT, "public", "swatches")
REFERENCE_VERSION = "libidex-chart-seed-v1"
SOURCE_URL = "https://libidex.com/"

# ---------------------------------------------------------------------------
# Colour table: (display_name, category, finish, hex, hue_note)
#   category = Libidex chart family as shown to customers
#   finish   = material behaviour key used by generation guidance + swatch art
# ---------------------------------------------------------------------------
COLOURS = [
    # -- Standard ------------------------------------------------------------
    ("Black", "Standard", "standard", "#151517", "deep true black"),
    ("White", "Standard", "standard", "#F0EFEA", "clean solid white"),
    ("Red", "Standard", "standard", "#D81E26", "classic saturated red"),
    ("Royal Blue", "Standard", "standard", "#1E4FBC", "bright classic royal blue"),
    ("Mid Blue", "Standard", "standard", "#2F6FB4", "medium blue"),
    ("Light Blue", "Standard", "standard", "#6FB7E8", "pale sky blue"),
    ("Turquoise", "Standard", "standard", "#1FA9A0", "blue-green turquoise"),
    ("Jade Green", "Standard", "standard", "#1F8F6E", "rich jade green"),
    ("Natural Green", "Standard", "standard", "#3F9E4D", "natural mid green"),
    ("Olive Green", "Standard", "standard", "#5C6B32", "muted olive green"),
    ("Nightshade Blue", "Standard", "standard", "#27306B", "very dark inky blue"),
    ("Damson Purple", "Standard", "standard", "#6B2D5C", "dark plum-purple"),
    ("Plum", "Standard", "standard", "#7A3E6F", "warm plum"),
    ("Lilac", "Standard", "standard", "#B794C9", "soft lilac"),
    ("Orange", "Standard", "standard", "#F07818", "bright orange"),
    ("Atomic Tangerine", "Standard", "standard", "#FF8A3D", "vivid tangerine orange"),
    ("Yellow", "Standard", "standard", "#F5D21E", "bright primary yellow"),
    ("Baby Pink", "Standard", "standard", "#F6C1D4", "pale baby pink"),
    ("Bubblegum Pink", "Standard", "standard", "#F28AB8", "mid bubblegum pink"),
    ("Party Pink", "Standard", "standard", "#EF5BA8", "vivid party pink"),
    ("Raspberry Pink", "Standard", "standard", "#D62E6E", "deep raspberry pink"),
    ("Mannequin", "Standard", "standard", "#C8A28C", "warm flesh-tone beige"),
    ("Sand", "Standard", "standard", "#D8C39A", "pale sandy beige"),
    ("Chocolate", "Standard", "standard", "#5A3A28", "deep chocolate brown"),
    ("Bronze", "Standard", "standard", "#8C6239", "warm bronze brown"),
    ("Burnt Medical Orange", "Standard", "standard", "#B8481F", "dark burnt orange"),
    # -- Vibrant --------------------------------------------------------------
    ("Vibrant Bright Pink", "Vibrant", "vibrant", "#FF2E88", "hyper-saturated hot pink"),
    ("Vibrant Lime Green", "Vibrant", "vibrant", "#A6E22A", "hyper-saturated lime green"),
    # -- Metallic -------------------------------------------------------------
    ("Metallic Red", "Metallic", "metallic", "#A01220", "rich deep red with subtle metallic depth"),
    ("Metallic Blue", "Metallic", "metallic", "#1F3F8F", "deep metallic blue"),
    ("Metallic Petrol Blue", "Metallic", "metallic", "#14606E", "dark blue-green petrol metallic"),
    ("Metallic Peacock", "Metallic", "metallic", "#0E6B74", "deep blue-green peacock metallic"),
    ("Metallic Green", "Metallic", "metallic", "#1F7A4D", "deep metallic green"),
    ("Metallic Purple", "Metallic", "metallic", "#5B2E8C", "deep metallic purple"),
    ("Metallic Fuschia", "Metallic", "metallic", "#B3248C", "deep metallic fuschia pink"),
    ("Metallic Grey", "Metallic", "metallic", "#707782", "mid grey metallic"),
    ("Metallic Platinum", "Metallic", "metallic", "#B8BCC4", "light platinum silver metallic"),
    ("Metallic Pewter", "Metallic", "metallic", "#5E646C", "dark pewter grey metallic"),
    ("Metallic Old Gold", "Metallic", "metallic", "#9C7A28", "antique old gold metallic"),
    ("Metallic Electrum", "Metallic", "metallic", "#B78C3C", "pale gold-green electrum metallic"),
    ("Metallic Honey", "Metallic", "metallic", "#B06A24", "warm honey amber metallic"),
    # -- Pearlsheen -----------------------------------------------------------
    ("Pearlsheen Silver", "Pearlsheen", "pearlsheen", "#D8D9DC", "pearlescent silver-white with soft iridescent sheen"),
    ("Pearlsheen Gold", "Pearlsheen", "pearlsheen", "#D9C28E", "pearlescent soft gold"),
    ("Pearlsheen Antique Gold", "Pearlsheen", "pearlsheen", "#BFA06A", "pearlescent antique gold"),
    ("Pearlsheen Emerald", "Pearlsheen", "pearlsheen", "#7FBFA8", "pearlescent soft emerald green"),
    ("Pearlsheen Purple", "Pearlsheen", "pearlsheen", "#9D84C4", "pearlescent soft purple"),
    # -- Electric -------------------------------------------------------------
    ("Electric Blue", "Electric", "electric", "#1447E6", "hyper-vivid saturated electric blue"),
    ("Electric Leaf", "Electric", "electric", "#4DD23C", "hyper-vivid electric leaf green"),
    ("Electric Lilac", "Electric", "electric", "#B84DF0", "hyper-vivid electric lilac"),
    ("Electric Rose", "Electric", "electric", "#F0379A", "hyper-vivid electric rose pink"),
    # -- Translucent ----------------------------------------------------------
    ("Translucent Blue", "Translucent", "translucent", "#2E63C8", "dense saturated translucent blue - predominantly solid at normal viewing distance, subtly translucent only in stretched or strongly highlighted areas"),
    ("Translucent Natural", "Translucent", "translucent", "#E8D8C0", "milky natural translucent"),
    ("Translucent Natural Green", "Translucent", "translucent", "#7FBF8E", "milky natural green translucent"),
    ("Translucent Olive", "Translucent", "translucent", "#7A8450", "muted olive translucent"),
    ("Translucent Smokey Black", "Translucent", "translucent", "#3A3D42", "dark smokey translucent - dense, reads almost solid black with subtle translucency at highlights"),
    ("Translucent Red", "Translucent", "translucent", "#C0394A", "dense translucent red"),
    ("Translucent Pink", "Translucent", "translucent", "#E893B8", "dense translucent pink"),
    ("Translucent Orange", "Translucent", "translucent", "#E8834A", "dense translucent orange"),
    ("Translucent Yellow", "Translucent", "translucent", "#E8C84E", "dense translucent yellow"),
    ("Translucent Lilac", "Translucent", "translucent", "#A98CC8", "dense translucent lilac"),
    ("Translucent Metallic", "Translucent", "translucent", "#7E8899", "silvery translucent metallic - dense silvery tone with subtle depth"),
    # -- Semi-Translucent -----------------------------------------------------
    ("Semi Trans Flesh", "Semi-Translucent", "semi_translucent", "#E3BFA8", "flesh-tone semi-transparent"),
    ("Semi Trans Red", "Semi-Translucent", "semi_translucent", "#D64552", "red semi-transparent"),
    ("Semi Trans Yellow", "Semi-Translucent", "semi_translucent", "#E6CD55", "yellow semi-transparent"),
    ("Semi Trans. Cloud Grey", "Semi-Translucent", "semi_translucent", "#B8BCC2", "pale cloud grey semi-transparent"),
    ("Semi Transparent Mauve", "Semi-Translucent", "semi_translucent", "#9B7E94", "dusty mauve semi-transparent"),
    ("Semi Trans Vibrant Green", "Semi-Translucent", "semi_translucent", "#3FD67A", "vivid green semi-transparent"),
    ("Semi Trans Vibrant Magenta", "Semi-Translucent", "semi_translucent", "#E0449E", "vivid magenta semi-transparent"),
    ("Semi Trans Vibrant Orange", "Semi-Translucent", "semi_translucent", "#FF8040", "vivid orange semi-transparent"),
    ("Semi Trans Vibrant Red", "Semi-Translucent", "semi_translucent", "#F03A45", "vivid red semi-transparent"),
    ("Semi Trans Vibrant Yellow", "Semi-Translucent", "semi_translucent", "#F5DC3C", "vivid yellow semi-transparent"),
    # -- Supatex --------------------------------------------------------------
    ("Supatex Grey", "Supatex", "supatex", "#3E4148", "dark grey with Supatex extra-gloss finish"),
    ("Supatex Light Brown", "Supatex", "supatex", "#8A6B52", "light brown with Supatex extra-gloss finish"),
    ("Supatex Violet", "Supatex", "supatex", "#4E2E8C", "deep violet with Supatex extra-gloss finish"),
    ("Supatex Semi-Transparent Aqua", "Supatex", "supatex", "#63C8C0", "aqua semi-transparent with Supatex extra-gloss finish"),
]

FINISH_GUIDANCE = {
    "standard": "normal saturated latex colour with realistic latex gloss",
    "vibrant": "hyper-saturated latex colour, extremely vivid, with realistic latex gloss",
    "metallic": "metallic latex - the colour carries subtle metallic depth and richness, but must NOT look like chrome or a mirror; reflections remain normal latex reflections",
    "pearlsheen": "pearlescent latex - soft iridescent pearly character; reads as pearlescent, never as ordinary flat colour and never as mirror chrome",
    "electric": "electric latex - extremely saturated, almost glowing intensity of colour with normal latex gloss",
    "translucent": "translucent latex - dense and saturated, predominantly solid at normal viewing distance, subtly translucent only in stretched or strongly highlighted areas; never glass-like, never clear plastic, no skin showing through",
    "semi_translucent": "semi-transparent latex - lighter and airier than fully solid latex; soft milky translucency, but still clearly a coloured latex panel, not clear plastic",
    "supatex": "Supatex latex - exceptionally high-gloss surface, the shiniest latex finish; bold broad highlights with deep saturated colour",
}

FINISH_LABEL = {
    "standard": "Standard",
    "vibrant": "Vibrant",
    "metallic": "Metallic",
    "pearlsheen": "Pearlsheen",
    "electric": "Electric",
    "translucent": "Translucent",
    "semi_translucent": "Semi-Translucent",
    "supatex": "Supatex",
}


# ---------------------------------------------------------------------------
# Minimal PNG writer (RGB, no deps)
# ---------------------------------------------------------------------------
def write_png(path, w, h, pixel_fn):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            r, g, b = pixel_fn(x / w, y / h)
            raw += bytes((min(255, max(0, int(r))), min(255, max(0, int(g))), min(255, max(0, int(b)))))
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def hex_rgb(hx):
    hx = hx.lstrip("#")
    return tuple(int(hx[i:i + 2], 16) for i in (0, 2, 4))


def clamp(v):
    return min(255, max(0, v))


def shade(rgb, f):
    return tuple(clamp(c * f) for c in rgb)


def mix(rgb, other, t):
    return tuple(clamp(c + (o - c) * t) for c, o in zip(rgb, other))


def swatch_pixel(hex_colour, finish):
    base = hex_rgb(hex_colour)

    def fn(u, v):
        # diagonal soft sheen: brighter top-left, darker bottom-right
        diag = (u * 0.55 + v * 0.45)
        light = 1.18 - 0.42 * diag
        rgb = shade(base, light)

        # broad soft vertical highlight band
        band = math.exp(-((v - 0.28) ** 2) / 0.02)
        edge = math.exp(-((v - 0.97) ** 2) / 0.004)

        if finish == "metallic":
            band2 = math.exp(-((v - 0.62) ** 2) / 0.008)
            rgb = mix(rgb, (255, 255, 255), band * 0.35 + band2 * 0.10)
            rgb = shade(rgb, 1.0 + 0.10 * math.sin(u * 25))
        elif finish == "pearlsheen":
            irid = (math.sin(u * 6.28 + v * 3) + 1) / 2
            tint = mix((255, 210, 235), (190, 235, 255), irid)
            rgb = mix(rgb, tint, 0.16)
            rgb = mix(rgb, (255, 255, 255), band * 0.30)
        elif finish in ("translucent", "semi_translucent"):
            inner = math.exp(-(((u - 0.5) ** 2 + (v - 0.45) ** 2) / 0.18))
            rgb = mix(rgb, (255, 255, 255), inner * (0.28 if finish == "semi_translucent" else 0.16))
            rgb = mix(rgb, (255, 255, 255), band * 0.22)
        elif finish == "electric":
            rgb = mix(rgb, (255, 255, 255), band * 0.38)
            rgb = tuple(clamp(c * 1.06) for c in rgb)
        elif finish == "supatex":
            rgb = mix(rgb, (255, 255, 255), band * 0.55 + edge * 0.15)
        elif finish == "vibrant":
            rgb = mix(rgb, (255, 255, 255), band * 0.30)
        else:
            rgb = mix(rgb, (255, 255, 255), band * 0.25)

        # subtle bottom edge shadow
        rgb = shade(rgb, 1.0 - 0.25 * math.exp(-((v - 1.0) ** 2) / 0.002))
        return rgb

    return fn


def slugify(name):
    s = name.lower().replace(".", "").replace("-", " ")
    return "_".join(s.split())


def main():
    records = []
    for display_name, category, finish, hx, hue in COLOURS:
        cid = "libidex_" + slugify(display_name)
        records.append({
            "id": cid,
            "manufacturer": "Libidex",
            "display_name": display_name,
            "category": category,
            "finish": FINISH_LABEL[finish],
            "active": True,
            "references": [f"/swatches/{cid}.png"],
            "source_url": SOURCE_URL,
            "generation_guidance": f"{hue}; {FINISH_GUIDANCE[finish]}",
            "reference_version": REFERENCE_VERSION,
            "swatch_hex": hx,
        })
        write_png(os.path.join(SWATCH_DIR, f"{cid}.png"), 240, 160, swatch_pixel(hx, finish))

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "manufacturer": "Libidex",
            "reference_version": REFERENCE_VERSION,
            "source_url": SOURCE_URL,
            "colours": records,
        }, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(records)} colour records to {DATA_PATH}")
    print(f"Wrote {len(records)} swatch PNGs to {SWATCH_DIR}")


if __name__ == "__main__":
    main()
