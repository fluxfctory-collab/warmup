"""Step 1-4: isolate the sleeve from the green cutting mat, defringe, white-balance.

The mat is olive green and the sleeve (cream fleece, blue-charcoal knit, cool
white hook-and-loop) is bluish, so B - G separates them cleanly, including the
dark grid lines (which are green-black, B - G < 0). See docs/ASSETS.md §3.
"""
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

from .paths import FLATLAY

THRESH = 1.5  # B - G, after a sigma=2 blur


def load_flatlay() -> np.ndarray:
    return np.asarray(Image.open(FLATLAY).convert("RGB")).astype(np.float32)


def sleeve_mask(img: np.ndarray):
    """Return (binary mask, B-G score map)."""
    blur = cv2.GaussianBlur(img, (0, 0), 2.0)
    score = blur[..., 2] - blur[..., 1]
    m = score > THRESH
    lab, n = ndi.label(m)
    sizes = ndi.sum(m, lab, range(1, n + 1))
    m = lab == (int(np.argmax(sizes)) + 1)
    m = ndi.binary_fill_holes(m)
    # smooth jaggies from JPEG blocks, then refill
    m = ndi.binary_opening(m, structure=np.ones((5, 5)))
    m = ndi.binary_closing(m, structure=np.ones((7, 7)))
    m = ndi.binary_fill_holes(m)
    lab, n = ndi.label(m)
    sizes = ndi.sum(m, lab, range(1, n + 1))
    m = lab == (int(np.argmax(sizes)) + 1)
    return m, score


def soft_alpha(mask: np.ndarray, score: np.ndarray) -> np.ndarray:
    """Soft alpha: inside a narrow band around the binary edge, alpha follows
    the B-G score ramp so fleece fibres stay soft instead of being cut."""
    inner = ndi.binary_erosion(mask, iterations=3)
    outer = ndi.binary_dilation(mask, iterations=2)
    band = outer & ~inner
    ramp = np.clip((score - (-6.0)) / (7.0 - (-6.0)), 0, 1)
    a = np.where(inner, 1.0, 0.0)
    a = np.where(band, ramp, a)
    # pull the edge in by ~1px and feather to avoid a halo
    a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 0.9)
    a = np.clip((a - 0.12) / 0.88, 0, 1)
    return a.astype(np.float32)


def local_background(img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Estimate the mat colour under the sleeve edge by normalized convolution
    of mat-only pixels (grid lines included, they are part of the background)."""
    bg = (~ndi.binary_dilation(mask, iterations=4)).astype(np.float32)
    small = 0.25
    h, w = mask.shape
    sw, sh = int(w * small), int(h * small)
    ims = cv2.resize(img * bg[..., None], (sw, sh), interpolation=cv2.INTER_AREA)
    ws = cv2.resize(bg, (sw, sh), interpolation=cv2.INTER_AREA)
    num = cv2.GaussianBlur(ims, (0, 0), 6)
    den = cv2.GaussianBlur(ws, (0, 0), 6)[..., None]
    est = num / np.maximum(den, 1e-4)
    return cv2.resize(est, (w, h), interpolation=cv2.INTER_LINEAR)


def defringe(img: np.ndarray, alpha: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Un-premultiply edge pixels against the local mat colour and remove
    residual green spill in a narrow edge band."""
    bgc = local_background(img, mask)
    a = alpha[..., None]
    fg = (img - (1 - a) * bgc) / np.maximum(a, 0.08)
    fg = np.clip(fg, 0, 255)
    edge = (alpha > 0.002) & (alpha < 0.995)
    out = img.copy()
    out[edge] = fg[edge]
    # spill suppression in a ~6px band inside the edge
    inner6 = ndi.binary_erosion(mask, iterations=6)
    band = (alpha > 0) & ~inner6
    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    lim = (r + b) / 2 + 2.0  # sleeve materials are never greener than this
    g2 = np.where(band & (g > lim), lim, g)
    out[..., 1] = g2
    return out


def white_balance(img: np.ndarray) -> np.ndarray:
    """Neutralise the cool/violet cast and lift exposure so the fleece reads as
    cream (~#EEE8DF in lit areas) and the rib knit stays textured."""
    fleece = img[900:1100, 1500:1700].reshape(-1, 3).mean(0)
    target = np.array([238.0, 232.0, 223.0])
    gains = target / fleece
    out = img * gains
    out = np.clip(out, 0, 255) / 255.0
    out = out ** 0.94  # gentle shadow lift for the charcoal rib
    # protect highlights: soft shoulder above 0.93
    hi = out > 0.93
    out[hi] = 0.93 + (out[hi] - 0.93) * 0.6
    return np.clip(out * 255.0, 0, 255).astype(np.float32)


def run():
    img = load_flatlay()
    mask, score = sleeve_mask(img)
    alpha = soft_alpha(mask, score)
    clean = defringe(img, alpha, mask)
    graded = white_balance(clean)
    return graded, alpha, mask
