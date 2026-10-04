"""Steps 6-7: contact shadow, responsive exports, crops, references, logo."""
import json
import re
import subprocess

import cv2
import numpy as np
from PIL import Image

from .paths import OUT, PUBLIC, CACHE, ROOT, FLATLAY, WORN, LOGO_PNG, LOGO_PDF

SHADOW_RGB = np.array([18, 30, 52], np.float32)  # cool ink, matches --ink family


def to_image(rgb, a):
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(a, 0, 1) * 255]).astype(np.uint8), "RGBA")


def crop_to_content(rgb, a, pad=(40, 40, 40, 90)):
    """pad = (left, top, right, bottom) in px."""
    ys, xs = np.where(a > 0.02)
    l, t, r, b = pad
    x0, x1 = max(xs.min() - l, 0), xs.max() + r
    y0, y1 = max(ys.min() - t, 0), ys.max() + b
    H, W = a.shape
    if x1 >= W or y1 >= H:  # pad the canvas if needed
        nh, nw = max(H, y1 + 1), max(W, x1 + 1)
        rgb2 = np.zeros((nh, nw, 3), np.float32)
        a2 = np.zeros((nh, nw), np.float32)
        rgb2[:H, :W] = rgb
        a2[:H, :W] = a
        rgb, a = rgb2, a2
    return rgb[y0:y1 + 1, x0:x1 + 1], a[y0:y1 + 1, x0:x1 + 1], (int(x0), int(y0))


def add_contact_shadow(rgb, a, scale=1.0, down=(0, 1)):
    """Soft, physically plausible shadow for a flat-lay lit from above:
    a tight contact shadow plus a wide ambient one, both slightly offset
    'down' (direction in image space)."""
    a32 = a.astype(np.float32)
    dx, dy = down

    def shifted_blur(sigma, off, opacity):
        m = np.float32([[1, 0, dx * off], [0, 1, dy * off]])
        s = cv2.warpAffine(a32, m, (a.shape[1], a.shape[0]))
        return cv2.GaussianBlur(s, (0, 0), sigma) * opacity

    s = 1 - (1 - shifted_blur(6 * scale, 5 * scale, 0.20)) * (1 - shifted_blur(26 * scale, 16 * scale, 0.10))
    out_a = a32 + s * (1 - a32)
    out_rgb = (rgb * a32[..., None] + SHADOW_RGB * (s * (1 - a32))[..., None]) / np.maximum(out_a, 1e-4)[..., None]
    return out_rgb, out_a


def save_variants(img: Image.Image, base: str, widths, png=True, avif_q=58, webp_q=82):
    """Write {base}@{w}.{avif,webp,png}; returns list of dicts."""
    made = []
    for w in widths:
        h = round(img.height * w / img.width)
        im = img.resize((w, h), Image.LANCZOS)
        stem = f"{base}@{w}"
        im.save(OUT / f"{stem}.avif", quality=avif_q, speed=4)
        im.save(OUT / f"{stem}.webp", quality=webp_q, method=6)
        if png:
            im.save(OUT / f"{stem}.png", optimize=True)
        made.append({"w": w, "h": h})
    return made


def save_jpeg_variants(img: Image.Image, base: str, widths, avif_q=60, webp_q=84, jpg_q=86):
    made = []
    for w in widths:
        h = round(img.height * w / img.width)
        im = img.resize((w, h), Image.LANCZOS) if w != img.width else img.copy()
        stem = f"{base}@{w}"
        im.save(OUT / f"{stem}.avif", quality=avif_q, speed=4)
        im.save(OUT / f"{stem}.webp", quality=webp_q, method=6)
        im.convert("RGB").save(OUT / f"{stem}.jpg", quality=jpg_q, optimize=True, progressive=True)
        made.append({"w": w, "h": h})
    return made


def flatten_on(img: Image.Image, color):
    bg = Image.new("RGBA", img.size, color + (255,))
    bg.alpha_composite(img)
    return bg.convert("RGB")


# ---------------------------------------------------------------------------
def export_product(rgb, a, manifest, hotspots_src):
    """Horizontal flat-lay + vertical art-directed version."""
    crgb, ca, (ox, oy) = crop_to_content(rgb, a, pad=(48, 48, 56, 110))
    srgb, sa = add_contact_shadow(crgb, ca, scale=1.0, down=(0, 1))
    hero = to_image(srgb, sa)
    hero.save(CACHE / "flatlay-master.png")
    manifest["flatlay"] = {
        "w": hero.width, "h": hero.height,
        "sizes": save_variants(hero, "warmup-sleeve-with-mitten-flatlay", [960, 1600, 2400]),
    }
    # hotspot positions as % of the exported image box
    manifest["hotspots"] = {
        k: {"x": round((x - ox) / hero.width * 100, 2), "y": round((y - oy) / hero.height * 100, 2)}
        for k, (x, y) in hotspots_src.items()
    }

    # vertical: rotate 90deg clockwise -> upper-arm cuff at the top, mitten at
    # the bottom, thumb on the left (as in the worn photo)
    vrgb = np.ascontiguousarray(np.rot90(crgb, k=-1))
    va = np.ascontiguousarray(np.rot90(ca, k=-1))
    vrgb, va, _ = crop_to_content(vrgb, va, pad=(48, 48, 64, 96))
    vsrgb, vsa = add_contact_shadow(vrgb, va, scale=1.0, down=(0, 1))
    vert = to_image(vsrgb, vsa)
    vert.save(CACHE / "vertical-master.png")
    manifest["vertical"] = {
        "w": vert.width, "h": vert.height,
        "sizes": save_variants(vert, "warmup-sleeve-with-mitten-vertical", [480, 720, 1200]),
    }
    # vertical hotspot positions: rotation (x, y) -> (H - 1 - y, x) in the
    # cropped horizontal frame, then account for the vertical crop
    H0 = ca.shape[0]
    vys, vxs = np.where(np.rot90(ca, k=-1) > 0.02)
    vx0, vy0 = max(vxs.min() - 48, 0), max(vys.min() - 48, 0)
    manifest["hotspotsVertical"] = {}
    for k, (x, y) in hotspots_src.items():
        cx, cy = x - ox, y - oy
        rx, ry = H0 - 1 - cy, cx
        manifest["hotspotsVertical"][k] = {
            "x": round((rx - vx0) / vert.width * 100, 2),
            "y": round((ry - vy0) / vert.height * 100, 2),
        }
    return hero, vert


def export_crops(rgb, a, manifest, crops, bg_color):
    """Detail crops (in full-res composite coordinates) flattened on bg."""
    full = flatten_on(to_image(rgb, a), bg_color)
    manifest["crops"] = {}
    for name, (box, widths) in crops.items():
        im = full.crop(box)
        manifest["crops"][name] = {
            "w": im.width, "h": im.height,
            "sizes": save_jpeg_variants(im, f"warmup-detail-{name}", widths),
        }


def export_references(manifest):
    """Untouched prototype photos: resized only, never upscaled."""
    flat = Image.open(FLATLAY).convert("RGB")
    worn = Image.open(WORN).convert("RGB")
    manifest["refFlatlay"] = {
        "w": flat.width, "h": flat.height,
        "sizes": save_jpeg_variants(flat, "prototype-2-4-flatlay-original", [560, 1120]),
    }
    manifest["refWorn"] = {
        "w": worn.width, "h": worn.height,
        "sizes": save_jpeg_variants(worn, "prototype-2-4-worn-original", [280, worn.width]),
    }


def _archivo(size, wght, wdth):
    """Archivo variable, converted from the self-hosted woff2 (same face as
    the site) so the OG card uses the brand typeface."""
    from PIL import ImageFont
    ttf = CACHE / "archivo-wdth.ttf"
    if not ttf.exists():
        from fontTools.ttLib import TTFont
        f = TTFont(ROOT / "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2")
        f.flavor = None
        f.save(ttf)
    font = ImageFont.truetype(str(ttf), size)
    font.set_variation_by_axes([wght, wdth])
    return font


def export_og(hero: Image.Image, logo: Image.Image):
    from PIL import ImageDraw
    W, H = 1200, 630
    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    lw = 280
    lg = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    canvas.alpha_composite(lg, (64, 64))
    d = ImageDraw.Draw(canvas)
    title = "Arm and hand warming sleeve"
    f1 = _archivo(36, 720, 114)
    tw = d.textlength(title, font=f1)
    d.text((W - 64 - tw, 86), title, font=f1, fill=(16, 36, 70))
    band_y = 196
    canvas.alpha_composite(Image.new("RGBA", (W, H - band_y), (237, 242, 251, 255)), (0, band_y))
    pw = 1040
    prod = hero.resize((pw, round(hero.height * pw / hero.width)), Image.LANCZOS)
    canvas.alpha_composite(prod, ((W - pw) // 2, band_y + 10))
    f2 = _archivo(18, 450, 100)
    d.text((64, H - 40), "Proposed design visualization with integrated mitten, based on Prototype 2.4.",
           font=f2, fill=(82, 96, 120))
    canvas.convert("RGB").save(OUT / "warmup-og.jpg", quality=86, optimize=True, progressive=True)


def export_logo(manifest):
    logo = Image.open(LOGO_PNG).convert("RGBA")
    manifest["logo"] = {"w": logo.width, "h": logo.height, "sizes": []}
    for w in [176, 232, 352, 464, 528, 696]:
        h = round(logo.height * w / logo.width)
        im = logo.resize((w, h), Image.LANCZOS)
        im.save(OUT / f"warmup-logo@{w}.png", optimize=True)
        im.save(OUT / f"warmup-logo@{w}.webp", quality=92, method=6)
        manifest["logo"]["sizes"].append({"w": w, "h": h})
    return logo


def export_favicons(logo: Image.Image):
    """Tight crop of the existing 'UP' badge (no redrawing)."""
    a = np.asarray(logo)[..., 3]
    # the badge is the right-most block; find the column gap after the 'M'
    cols = (a > 16).any(0)
    x = a.shape[1] - 1
    while cols[x]:
        x -= 1
    # walk left past the badge until we hit an empty column
    xs = np.where(cols)[0]
    gaps = np.where(np.diff(xs) > 1)[0]
    bx0 = xs[gaps[-1] + 1] if len(gaps) else xs[0]
    badge = logo.crop((bx0, 0, logo.width, logo.height))
    bb = badge.getbbox()
    badge = badge.crop(bb)
    side = max(badge.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.alpha_composite(badge, ((side - badge.width) // 2, (side - badge.height) // 2))
    sq.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32.png", optimize=True)
    sq.resize((512, 512), Image.LANCZOS).save(PUBLIC / "icon-512.png", optimize=True)
    # apple-touch-icon must be opaque (iOS fills transparency with black)
    pad = int(side * 0.10)
    sq2 = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (255, 255, 255, 255))
    sq2.alpha_composite(sq, (pad, pad))
    sq2.convert("RGB").resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    return int(bx0) / logo.width


def export_favicon_svg(badge_x_frac: float):
    """SVG favicon from the vector PDF: keep only the badge group (and the
    defs it references), crop the viewBox to a square around the badge."""
    import xml.etree.ElementTree as ET

    tmp = CACHE / "logo-full.svg"
    try:
        subprocess.run(["pdftocairo", "-svg", str(LOGO_PDF), str(tmp)], check=True)
    except (OSError, subprocess.CalledProcessError):
        return False
    NS = "http://www.w3.org/2000/svg"
    ET.register_namespace("", NS)
    ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
    root = ET.parse(tmp).getroot()
    defs = root.find(f"{{{NS}}}defs")
    tops = [el for el in root if el is not defs]

    def first_x(el):
        for p in el.iter(f"{{{NS}}}path"):
            m = re.match(r"\s*M\s*([\d.]+)", p.get("d", ""))
            if m:
                return float(m.group(1))
        return 0.0

    badge = [el for el in tops if first_x(el) > 440]
    if len(badge) != 1:
        return False
    badge = badge[0]
    by_id = {d.get("id"): d for d in defs}
    needed, stack = set(), [badge]
    while stack:
        el = stack.pop()
        for node in el.iter():
            for v in node.attrib.values():
                for ref in re.findall(r"url\(#([^)]+)\)", v):
                    if ref not in needed and ref in by_id:
                        needed.add(ref)
                        stack.append(by_id[ref])
    for d in list(defs):
        if d.get("id") not in needed:
            defs.remove(d)
    for el in tops:
        if el is not badge:
            root.remove(el)
    ax0, aw = 0.9598, 688.9168          # artwork box in PDF points
    by, bh = 0.9595, 171.5035
    bx = ax0 + badge_x_frac * aw
    bw = ax0 + aw - bx
    side = max(bw, bh)
    root.set("viewBox", f"{bx - (side - bw) / 2:.3f} {by - (side - bh) / 2:.3f} {side:.3f} {side:.3f}")
    root.set("width", "64")
    root.set("height", "64")
    ET.ElementTree(root).write(PUBLIC / "favicon.svg", xml_declaration=False, encoding="unicode")
    return True


def write_manifest(manifest):
    (CACHE / "manifest.json").write_text(json.dumps(manifest, indent=2))
