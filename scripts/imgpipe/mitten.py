"""Step 5: replace the open fingerless hand section with an integrated mitten.

Conservative extension of Prototype 2.4 (see docs/DESIGN_PLAN.md §8):
  * the existing charcoal rib-knit wrist section and its topstitching are kept;
  * the knit tube is extended to the right by quilting the photo's own knit
    (ribs run lengthwise, so rows stay aligned), then warped into a rounded
    finger chamber whose ribs converge toward the tip;
  * a separate thumb is built from the same knit, rotated so its ribs follow
    the thumb, shaded with the tube's own cross-section profile, and placed on
    the edge opposite the strap (as in the worn photo).
All geometry is in full-resolution flat-lay pixel coordinates.
"""
import cv2
import numpy as np
from scipy import ndimage as ndi

# --- geometry (px, flat-lay coordinates) ---------------------------------
CUFF_SEAM_X = 620       # charcoal cuff -> fleece
WRIST_SEAM_X = 2960     # fleece -> wrist rib knit
OPEN_END_X = 3618       # current open end of the fingerless hand section
FLEECE_LEN = WRIST_SEAM_X - CUFF_SEAM_X
HAND_RATIO = 0.35       # wrist seam -> fingertip, as a fraction of FLEECE_LEN
TIP_X = int(WRIST_SEAM_X + HAND_RATIO * FLEECE_LEN)
WARP_START_X = 3200     # original pixels are untouched left of this
TIP_ROUND = 240         # length of the rounded tip
TAPER = 0.075           # chamber narrows by 7.5% before the tip rounds
TIP_P = 2.3             # superellipse exponent for the tip

THUMB_BASE_FRAC = 0.60  # along the knit section, from the wrist seam
THUMB_ANGLE = 38.0      # degrees below the hand axis, toward the fingertips
THUMB_LEN = 330         # base point (inside the hand edge) -> tip
THUMB_HALF_W = 88

PAD_RIGHT = 260         # canvas padding so the tip and shadow fit


def _smoothstep(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def _edges(alpha, thr=0.5):
    """Top/bottom alpha edges per column (NaN where empty)."""
    h, w = alpha.shape
    on = alpha > thr
    any_ = on.any(0)
    top = np.where(any_, on.argmax(0), np.nan).astype(np.float64)
    bot = np.where(any_, h - 1 - on[::-1].argmax(0), np.nan).astype(np.float64)
    return top, bot


def _fill_nan(v):
    idx = np.arange(len(v))
    good = ~np.isnan(v)
    return np.interp(idx, idx[good], v[good])


def _min_cut_path(err):
    """Vertical min-cost seam through err (rows x cols); returns col per row."""
    h, w = err.shape
    cost = err.copy()
    back = np.zeros((h, w), np.int8)
    for y in range(1, h):
        prev = cost[y - 1]
        left = np.r_[np.inf, prev[:-1]]
        right = np.r_[prev[1:], np.inf]
        stack = np.vstack([left, prev, right])
        k = stack.argmin(0)
        cost[y] += stack[k, np.arange(w)]
        back[y] = k - 1
    path = np.zeros(h, np.int64)
    path[-1] = int(cost[-1].argmin())
    for y in range(h - 1, 0, -1):
        path[y - 1] = np.clip(path[y] + back[y, path[y]], 0, w - 1)
    return path


def extend_tube(rgb, alpha, shift=380, ov0=3390, ov1=3560):
    """Extend the knit tube to the right with a copy of itself shifted by
    `shift` px, joined along a minimum-error seam inside [ov0, ov1)."""
    h, w, _ = rgb.shape
    # best vertical alignment of the copy (ribs are horizontal)
    band = slice(700, 1130)
    best = (1e18, 0)
    for dy in range(-8, 9):
        a = rgb[band, ov0:ov1]
        b = np.roll(rgb, dy, axis=0)[band, ov0 - shift:ov1 - shift]
        e = float(((a - b) ** 2).mean())
        best = min(best, (e, dy))
    dy = best[1]
    cp_rgb = np.zeros_like(rgb)
    cp_a = np.zeros_like(alpha)
    cp_rgb[:, shift:] = np.roll(rgb, dy, axis=0)[:, :-shift]
    cp_a[:, shift:] = np.roll(alpha, dy, axis=0)[:, :-shift]

    err = ((rgb[:, ov0:ov1] - cp_rgb[:, ov0:ov1]) ** 2).sum(2)
    err = cv2.GaussianBlur(err.astype(np.float32), (0, 0), 2)
    path = _min_cut_path(err) + ov0
    xs = np.arange(w)[None, :]
    # feathered selector: 0 = original, 1 = copy
    sel = np.clip((xs - path[:, None]) / 6.0 + 0.5, 0, 1).astype(np.float32)
    sel[:, :ov0] = 0
    sel[:, ov1:] = 1
    out_rgb = rgb * (1 - sel[..., None]) + cp_rgb * sel[..., None]
    out_a = alpha * (1 - sel) + cp_a * sel
    # nothing of the original sleeve exists right of the open end anyway
    return out_rgb, out_a, dy


def tube_profile(rgb, alpha, x0=3120, x1=3560, bins=64):
    """Mean low-frequency luminance across the tube's normalized height."""
    Y = rgb.mean(2)
    top, bot = _edges(alpha[:, x0:x1])
    ys = np.arange(alpha.shape[0])[:, None]
    c = (top + bot) / 2
    hh = (bot - top) / 2
    v = (ys - c[None, :]) / hh[None, :]
    Yb = Y[:, x0:x1]
    m = (np.abs(v) <= 1) & (alpha[:, x0:x1] > 0.95)
    idx = np.clip(((v[m] + 1) / 2 * (bins - 1)).round().astype(int), 0, bins - 1)
    s = np.bincount(idx, Yb[m], bins) / np.maximum(np.bincount(idx, None, bins), 1)
    s = ndi.gaussian_filter1d(s, 2.5, mode="nearest")
    return s


def _profile_at(prof, v):
    bins = len(prof)
    t = np.clip((v + 1) / 2 * (bins - 1), 0, bins - 1)
    return np.interp(t, np.arange(bins), prof)


def lowpass_masked(Y, wts, sigma):
    num = cv2.GaussianBlur((Y * wts).astype(np.float32), (0, 0), sigma)
    den = cv2.GaussianBlur(wts.astype(np.float32), (0, 0), sigma)
    return num / np.maximum(den, 1e-4)


def _smooth_noise_1d(n, sigma, amp, seed):
    rng = np.random.default_rng(seed)
    v = ndi.gaussian_filter1d(rng.standard_normal(n), sigma, mode="wrap")
    return v / (np.abs(v).max() + 1e-6) * amp


def _smooth_noise_2d(shape, sigma, amp, seed):
    rng = np.random.default_rng(seed)
    small = (max(4, shape[0] // 8), max(4, shape[1] // 8))
    v = rng.standard_normal(small).astype(np.float32)
    v = cv2.GaussianBlur(v, (0, 0), sigma / 8)
    v = cv2.resize(v, (shape[1], shape[0]), interpolation=cv2.INTER_CUBIC)
    return v / (np.abs(v).max() + 1e-6) * amp


SRC_MIN_F = 0.64        # ribs converge at most 1/0.64 = 1.56x toward the tip
RESYNTH_SIGMA = 8.0     # keeps ribs/stitches, removes wrinkles (~40-150 px)


def build(graded: np.ndarray, alpha: np.ndarray):
    """Return (rgb, alpha, info) on a canvas padded to the right."""
    h, w, _ = graded.shape
    W = w + PAD_RIGHT
    rgb = np.zeros((h, W, 3), np.float32)
    a = np.zeros((h, W), np.float32)
    rgb[:, :w] = graded
    a[:, :w] = alpha
    hand_a = a.copy()
    hand_a[:, :WRIST_SEAM_X + 60] = 0

    # 1. extend the knit tube to the right (rows aligned, min-error seam)
    ext_rgb, ext_a, dy = extend_tube(rgb, hand_a)

    # 2. re-synthesize low-frequency shading from the tube's own mean
    #    cross-section (top-lit), keeping the rib/stitch detail. Removes the
    #    cloned wrinkles; blends in from WARP_START_X so the original wrist
    #    section and its topstitching stay untouched.
    prof = tube_profile(rgb, hand_a)
    Y = ext_rgb.mean(2)
    wts = (ext_a > 0.9).astype(np.float32)
    Ylow = lowpass_masked(Y, wts, RESYNTH_SIGMA)
    top, bot = _edges(ext_a)
    top, bot = _fill_nan(top), _fill_nan(bot)
    cx = ndi.gaussian_filter1d((top + bot) / 2, 40, mode="nearest")
    hx = ndi.gaussian_filter1d((bot - top) / 2, 40, mode="nearest")
    ys = np.arange(h)[:, None].astype(np.float32)
    xs = np.arange(W)[None, :]
    vnorm = (ys - cx[None, :]) / hx[None, :]
    target = _profile_at(prof, np.clip(vnorm, -1, 1))
    target = target * (1 + _smooth_noise_2d((h, W), 60, 0.035, 7))
    blend = _smoothstep((xs - WARP_START_X) / 260.0)
    ratio = np.where(wts > 0, target / np.maximum(Ylow, 1), 1.0)
    ratio = 1 + (ratio - 1) * blend
    ext_rgb = np.clip(ext_rgb * ratio[..., None], 0, 255).astype(np.float32)

    # 3. warp into a finger chamber with a rounded tip
    x_r = TIP_X - TIP_ROUND
    xf = np.arange(W).astype(np.float64)
    taper = 1 - TAPER * _smoothstep((xf - WARP_START_X) / (x_r - WARP_START_X))
    u = np.clip((xf - x_r) / TIP_ROUND, 0, 1)
    tipk = np.where(xf <= x_r, 1.0, (1 - u ** TIP_P) ** (1 / TIP_P))
    tipk = np.where(xf >= TIP_X, 0.0, tipk)
    f = np.where(xf < WARP_START_X, 1.0, taper * tipk)
    f_src = np.maximum(f, SRC_MIN_F)
    cfz = cx.copy()
    cfz[OPEN_END_X - 80:] = cx[OPEN_END_X - 80]
    cfz = ndi.gaussian_filter1d(cfz, 30, mode="nearest")
    hfz = hx.copy()
    hfz[OPEN_END_X - 80:] = hx[OPEN_END_X - 80]
    hfz = ndi.gaussian_filter1d(hfz, 30, mode="nearest")
    map_y = (cx[None, :] + (ys - cfz[None, :]) * (hx[None, :] / hfz[None, :]) / f_src[None, :]).astype(np.float32)
    map_x = np.broadcast_to(xs.astype(np.float32), (h, W)).copy()
    # anti-alias where rows are compressed
    ext_vblur = cv2.GaussianBlur(ext_rgb, (1, 0), sigmaX=0.01, sigmaY=1.1)
    comp = np.clip((1 / f_src - 1) / 0.5, 0, 1)[None, :, None]
    wrgb = cv2.remap(ext_rgb, map_x, map_y, cv2.INTER_LINEAR, borderValue=0)
    wblr = cv2.remap(ext_vblur, map_x, map_y, cv2.INTER_LINEAR, borderValue=0)
    wrgb = wrgb * (1 - comp) + wblr * comp
    wa = cv2.remap(ext_a, map_x, map_y, cv2.INTER_LINEAR, borderValue=0)
    # geometric silhouette governs where rows are no longer compressed
    hd = hfz * f + _smooth_noise_1d(W, 6, 1.4, 11)
    geo = np.clip((hd[None, :] + 1.5 - np.abs(ys - cfz[None, :])) / 1.6 + 0.5, 0, 1)
    geo[:, xf >= TIP_X] = 0
    wa = np.minimum(wa, geo.astype(np.float32))

    # tip edge darkening (top/bottom edges already carry the tube's shading)
    tipzone = _smoothstep((xs - (x_r - 80)) / 160.0)
    dist = ndi.distance_transform_edt(wa > 0.5)
    tipdark = 1 - 0.30 * np.exp(-dist / 26.0) * tipzone
    wrgb = wrgb * tipdark[..., None]
    wa_soft = cv2.GaussianBlur(wa, (0, 0), 0.8)
    wa = np.where(xs >= OPEN_END_X - 200, np.minimum(wa, wa_soft), wa)

    hand_rgb = np.where((xs < WARP_START_X)[..., None], rgb, wrgb)
    hand_alpha = np.where(xs < WARP_START_X, a, wa)

    # 4. thumb ---------------------------------------------------------------
    hand_alpha_pre = hand_alpha
    knit_len = OPEN_END_X - WRIST_SEAM_X
    bx = WRIST_SEAM_X + THUMB_BASE_FRAC * knit_len
    by = float(cx[int(bx)] + hx[int(bx)] * 0.80)
    th = np.deg2rad(THUMB_ANGLE)
    d = np.array([np.cos(th), np.sin(th)])
    n = np.array([-np.sin(th), np.cos(th)])
    gy, gx = np.mgrid[0:h, 0:W].astype(np.float32)
    qx, qy = gx - bx, gy - by
    tu = qx * d[0] + qy * d[1]
    tv = qx * n[0] + qy * n[1]
    L, R = THUMB_LEN, THUMB_HALF_W
    # capsule SDF from u=-160 to u=L-R, radius tapering slightly to the tip
    seg_u = np.clip(tu, -160, L - R)
    rad = R * (1 - 0.07 * np.clip(seg_u / (L - R), 0, 1))
    sd = np.sqrt((tu - seg_u) ** 2 + tv ** 2) - rad
    edge_noise = _smooth_noise_1d(4096, 5, 1.3, 23)
    sd = sd - np.interp(np.clip(tu + 400, 0, 4095), np.arange(4096), edge_noise)
    # fillet the crotch between thumb and hand (smooth union of the SDFs) so
    # the thumb reads as sewn on, not laid next to the hand
    hm = hand_alpha_pre > 0.5
    hand_sd = ndi.distance_transform_edt(~hm) - ndi.distance_transform_edt(hm)
    k = 36.0
    hk = np.clip(k - np.abs(sd - hand_sd), 0, k) / k
    smin = np.minimum(sd, hand_sd) - hk * hk * k / 4
    near = (tu > -60) & (tu < L * 0.7)
    sd_union = np.where(near & (hand_sd > 0), np.minimum(sd, smin), sd)
    # knit edges are fuzzy: break the synthetic edge with fibre-scale noise
    rng = np.random.default_rng(5)
    fuzz = cv2.GaussianBlur(rng.standard_normal((h, W)).astype(np.float32), (0, 0), 0.8)
    fuzz = fuzz / (np.abs(fuzz).max() + 1e-6) * 2.2
    t_alpha = np.clip(-(sd_union + fuzz * (np.abs(sd_union) < 4)) / 1.5 + 0.5, 0, 1).astype(np.float32)
    t_alpha = cv2.GaussianBlur(t_alpha, (0, 0), 0.7)

    detail = Y / np.maximum(lowpass_masked(Y, wts, RESYNTH_SIGMA), 1)
    detail = np.clip(detail, 0.4, 1.8) ** 0.85
    detail = detail.astype(np.float32)
    base_col = ext_rgb[860:980, 3250:3500].reshape(-1, 3).mean(0)
    vn = np.clip(tv / np.maximum(rad, 1), -1.2, 1.2)
    uu = np.clip((tu - (L - R)) / R, 0, 1)
    conv = np.minimum(1 / np.sqrt(np.clip(1 - uu ** 2, 0.05, 1)), 1.4)
    sx0, sy0 = 3170.0, float(cx[3350])
    smap_x = (sx0 + 160 + np.clip(tu, -160, L)).astype(np.float32)
    smap_y = (sy0 + tv * conv).astype(np.float32)
    tdet = cv2.remap(detail, smap_x, smap_y, cv2.INTER_LINEAR, borderValue=1)
    pc = _profile_at(prof, np.array(0.0))
    shade = _profile_at(prof, np.clip(vn, -1, 1)) / pc
    shade = shade * (1 - 0.20 * np.clip(np.abs(vn), 0, 1) ** 4)
    shade = shade * (1 + _smooth_noise_2d((h, W), 50, 0.03, 31))
    trgb = base_col[None, None, :] * (tdet * shade)[..., None]
    # tip darkening and occlusion where the thumb tucks under the hand edge
    tdist = np.maximum(-sd, 0)
    tzone = _smoothstep((tu - (L - R - 40)) / 80.0)
    trgb = trgb * (1 - 0.24 * np.exp(-tdist / 18.0) * tzone)[..., None]
    hand_mask = hand_alpha > 0.5
    dist_hand = ndi.distance_transform_edt(~hand_mask)
    ao = 1 - 0.45 * np.exp(-dist_hand / 14.0)
    trgb = np.clip(trgb * ao[..., None], 0, 255)

    # 5. composite: hand over thumb
    ha = hand_alpha[..., None]
    ta = t_alpha[..., None]
    out_a = ha + ta * (1 - ha)
    out_rgb = (hand_rgb * ha + trgb * ta * (1 - ha)) / np.maximum(out_a, 1e-4)
    out_rgb = np.where(out_a > 0, out_rgb, 0)

    info = dict(
        tip_x=TIP_X, x_r=x_r, warp_start=WARP_START_X, copy_dy=dy,
        thumb_base=(round(bx), round(by)), thumb_angle=THUMB_ANGLE,
        hand_len=TIP_X - WRIST_SEAM_X, fleece_len=FLEECE_LEN,
        hand_ratio=round((TIP_X - WRIST_SEAM_X) / FLEECE_LEN, 3),
    )
    return out_rgb.astype(np.float32), out_a[..., 0].astype(np.float32), info
