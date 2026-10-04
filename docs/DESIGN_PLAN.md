# Design plan

Phase 2 output. QA scores and the iteration log are at the end (§9).

## 1. Idea in one line

**Cool to warm, arm to hand.** The logo runs from cool blue to warm red, left to right, and the page uses the same direction three ways:
- **Product views.** Horizontal views put the upper-arm end on the left and the mitten on the right.
- **Background.** The page starts on a blue-tinted neutral and reaches a pale warm surface only at the contact section.
- **Anatomy.** The details are numbered in the order your eye travels along the sleeve, from arm to hand.

Boldness is spent once, on a very large hero product. Everything else stays quiet.

## 2. Tokens

```css
--white:        #FFFFFF
--bg:           #F7F9FC   /* page base; keeps the cream fleece reading as cream */
--surface-blue: #EDF2FB   /* hero only: the "cool" start */
--surface-warm: #FFF4EF   /* contact only: the "warm" end */
--ink:          #102446   /* 15.0:1 on --bg */
--ink-2:        #526078   /* 6.0:1 on --bg, 5.6:1 on --surface-blue */
--line:         #DCE3EE
--line-strong:  #C3CDDD   /* hairline separators that must read on --surface-blue */
--blue:         #1F38AC   /* primary actions, links, focus ring; 9.0:1 on --bg */
--blue-deep:    #0F31AF   /* hover/pressed (logo's left stop) */
--plum:         #4A3488   /* one use: the research scope note's rule */
--coral:        #E44733   /* non-text only: mitten marker, warmth ticks */
--coral-text:   #C4361F   /* coral as text (5.1:1 on --bg, 4.6:1 on --surface-warm) */
--fleece:       #F1ECE3   /* reference tone only */
--knit:         #3E434B   /* reference tone only */
```

Every text/background pair is checked by axe in QA, plus by hand for the pairs axe cannot see (text over images: none).

**Proportion.** About 75% neutral (bg/white/blue surface), 20% ink and blue, under 5% coral. As built, coral appears only as:
- the mitten hotspot, its leader line and its note number;
- the short tick before each "proposed design visualization" caption (hero and anatomy);
- the tick above the mitten row in Construction;
- `--coral-text` for form error messages, which is functional.

Coral is never used for focus.

**Logo sizing.** In the logo the descriptor's cap height is 9.6% of the logo height, which gives:

| Logo width | Descriptor cap height |
|---|---|
| 232 px | ≈ 5.6 px |
| 176 px | ≈ 4.2 px |

The header starts at the top of the allowed range (232 px desktop, 176 px mobile) because the descriptor needs it. Clear space is at least 12 px on all sides, which is more than the badge's corner radius at that size (about 3 px).

## 3. Type

One family: **Archivo Variable** (wght 100–900, wdth 62–125), self-hosted from `@fontsource-variable/archivo` (latin subset via unicode-range), `font-display: swap`. Fallback: `"Archivo Variable", "Helvetica Neue", Arial, system-ui, sans-serif`.

| Role | Size | Weight / width | Tracking | Line height |
|---|---|---|---|---|
| H1 | `clamp(2.25rem, 1.2rem + 3.6vw, 4.5rem)` | 740 / 116% | −0.025em | 1.02 |
| H2 | `clamp(1.75rem, 1.1rem + 2vw, 2.75rem)` | 720 / 114% | −0.02em | 1.08 |
| H3 | 1.3125rem | 680 / 108% | −0.01em | 1.25 |
| Lead | 1.25–1.375rem | 450 / 100% | 0 | 1.45 |
| Body | 1.0625rem → 1.125rem ≥ 1024 px | 400 / 100% | 0 | 1.6, max 66ch |
| Small / caption | 0.875rem | 450 / 100% | 0 | 1.45 |

All type is sentence case, with no eyebrows, no all-caps, no mono and no coloured words in headlines. Headline line breaks are checked in screenshots, and `text-wrap: balance` is applied to h1/h2 so the last line is never one orphaned word.

## 4. Layout

- **Grid.** Container 1200 px, 12 columns, 24 px gutters (16 px below 600 px).
- **Side padding.** 64 px ≥ 1280, 40 px tablet, 20 px mobile.
- **Section rhythm.** It varies: Details gets the most air, FAQ the least.

| Section | Desktop | Mobile |
|---|---|---|
| Hero | 56 top | 32 top |
| Product | 112 | 72 |
| Details | 136 | 80 |
| Construction | 112 | 72 |
| Clinical | 104 | 64 |
| Research | 112 | 72 |
| FAQ | 96 | 64 |
| Contact | 120 | 72 |

- **Radii.**

| Radius | Used for |
|---|---|
| 8 px | Inputs, buttons, small controls |
| 16 px | Image frames, panels |
| Fully round | The close icon button only |

- **Depth.** One soft contact shadow under the product, baked into the image. The header gets a faint shadow after scroll. Nothing else has shadows.

## 5. Hero: two options, one choice

### Option 1: split, diagonal

```
┌──────────────────────────────────────────────────────────────────────┐
│ [LOGO]                         Product  Details  Research  FAQs [Contact]
├──────────────────────────────────────────────────────────────────────┤
│                                │                          ╱◖mitten  │
│  Comfort begins                │                    ╱╱╱╱╱            │
│  with warmth.                  │             ╱╱╱╱╱╱                   │
│                                │      ╱╱╱╱╱╱  (−13°)                  │
│  Lead…                         │ cuff╱╱                               │
│  [See the sleeve]  Read…       │                                      │
│        ~42%                    │              ~58%                    │
└──────────────────────────────────────────────────────────────────────┘
```
The composite with mitten is about 2.95 : 1. Rotated −13° inside a column about 830 px wide, the sleeve can only be **≈ 800 px long**.

### Option 2: stacked, full width (**chosen**)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [LOGO]                         Product  Details  Research  FAQs [Contact]
├──────────────────────────────────────────────────────────────────────┤
│  Comfort begins                          An arm-and-hand warming      │
│  with warmth.               (cols 1–7)   sleeve for patients…  (8–12) │
│                                          [See the sleeve] Read the…   │
│                                                                       │
│  ▐cuff▌═══════ fleece ════════════════════════════▐knit▌◗ mitten  ──▶ │ bleeds
│   strap ╲     [pouch]                                   ╰thumb        │ to edge
│                                    Proposed design visualization… ▸   │
├──────────────────────────────────────────────────────────────────────┤
│ Fleece and cotton │ Attached strap │ Heat-pack pouches │ Integrated mitten │
└──────────────────────────────────────────────────────────────────────┘
```

**Why Option 2.** At 1440 px the sleeve is about **1330 px long**, against about 800 px in Option 1, which is 1.7× larger. It stays horizontal, so the eye travels cuff → mitten in the same cool-to-warm direction as the logo, and the mitten sits at the right end, which bleeds toward the viewport edge without being cut. It also fits the first viewport:

| Viewport | Layout | Bottom of product image |
|---|---|---|
| 1440×1000 | Header 80, H1 2 lines ≈ 150, image ≈ 450 | ≈ 790 |
| 1280×800 | Same stack | ≈ 735, still above the fold |

**Tablet (768–1023).** H1 is full width, and the lead and buttons sit beneath it rather than beside it. The sleeve spans the full content width plus the right gutter. Recomposed this way, product and copy both fit in one 768×1024 screen.

**Mobile (< 600).** Copy comes first, then the **vertical** art-directed export: cuff at the top, mitten at the bottom, thumb on the left as in the worn photo. It is sized by width and never cropped. The caption sits under the mitten.

## 6. Section plan and generic check

| Section | Structure (each one different) |
|---|---|
| Header | Logo on white, text nav, one solid button. Sticky; a 1 px line and a faint shadow appear after 8 px of scroll. |
| Hero | Stacked, as above. Facts line with vertical hairlines that becomes a 2 × 2 grid on mobile. |
| Product | Editorial split: a tall crop of the real wrist seam (fleece meeting rib knit, light topstitching) on the left, copy on the right with the context sentence set apart. |
| Details | Full-width product, four hotspots ordered **arm to hand**. Notes 1–2 sit *above* the image with leader lines rising to them, notes 3–4 sit *below* with lines dropping, so lines never cross each other or text. A small **Prototype reference** pair closes the section. |
| Construction | Left: sticky heading. Right: a spec-sheet list of four hairline-separated rows, each with a real detail crop (fleece, strap, pouch slot, mitten). |
| Clinical | Two short columns split by one vertical hairline, then a single retention line. |
| Research | Scope note first, then an editorial reference list: year in a narrow column, citation, one or two descriptive sentences, text links. |
| FAQ | Heading left, accordion right. |
| Contact | Warm surface, short centred intro, form card on white. |
| Footer | Logo, one factual line, links, ©. |

### Generic check (choices that would appear on any similar page)

| Generic choice | Present? | Replaced with / note |
|---|---|---|
| Cream background + serif display | No | Cool neutral base, so the cream is the product, not the page. Archivo semi-expanded rhymes with the logo's wide geometry. |
| Terracotta accent everywhere | Risk | Coral is the logo's own right stop and is limited to four non-text uses (§2). |
| Identical rounded cards with grey shadows | Was in the first draft of Construction | **Changed** to a spec-sheet list with real product crops and hairlines. No card shadows anywhere. |
| Middle-dot meta strings | Facts line in the brief | Hairline separators. Research meta uses commas and line breaks. |
| "→" on buttons | No | Buttons state the action ("See the sleeve", "Send message"). |
| 01/02/03 on non-sequential content | Only in Details | There the numbers *are* keys between dots and notes, ordered along the garment. |
| Stat blocks / trust bars | No | None, and no numbers appear in marketing copy at all. |
| Gradient washes / glass / glow | No | The logo is the only gradient on the page. |
| Generic medical icons | No | Real product crops instead of icons. |
| Fade-up on every section | No | One load moment in the hero only. |
| Hero = photo in the right half | Avoided | Full-width stacked sleeve (Option 2). |
| Eyebrow label above every H2 | No | Removed entirely. |
| Hotspot = generic pulsing circle | Was the default | **Changed** to a rounded-square marker echoing the logo's "UP" badge. The active marker grows the badge's small upward notch: the one recurring logo-derived detail. No pulsing. |

## 7. Asset pipeline (Tier A photo composite)

The pipeline is `scripts/build_images.py`, run with `npm run images`. It reads only `source-assets/`, writes intermediates to `.cache/` and finals to `public/images/`, and is deterministic.

1. **Segment.** Smooth the image with a σ = 2 px blur, compute B − G, threshold at +1.5, keep the largest component and fill holes. This gives the binary mask (ASSETS §3).
2. **Soft edge.** Make alpha a ramp of B − G across a ±3 px band around the binary edge, so fleece fibres stay soft. Erode 1 px and feather.
3. **Defringe.** Estimate the local mat colour by normalized convolution over mat pixels. Un-premultiply the edge band against it: F = (I − (1 − α)·M) / α. In a 6 px band, clamp any remaining green (G > (R + B)/2) to neutral.
4. **White balance and tone.** Per-channel gains derived from the fleece sample, targeting about #EEE8DF in lit fleece. Mild shadow lift (gamma 0.94) so the rib knit stays textured, not crushed.
5. **Mitten** (details in §8):
   - extend the hand-section knit to the right by quilting with a minimum-error seam, rows aligned because the ribs run lengthwise;
   - reshape with a row-convergence warp into a rounded finger chamber;
   - build the thumb from a flattened knit patch rotated so its ribs follow the thumb;
   - add form shading and edge darkening, a crease where the thumb meets the hand, and the same soft 1.5 px edge.
6. **Shadow.** Contact shadow from the final alpha (tight 0.20 + ambient 0.08, offset down), exported on a transparent background.
7. **Exports.**
   - `warmup-sleeve-with-mitten-flatlay@{960,1600,2400}.{avif,webp,png}`
   - `warmup-sleeve-with-mitten-vertical@{480,720,1200}.{avif,webp,png}`, from a 90° rotation with a recomputed shadow (480 was added after Lighthouse)
   - detail crops for Product and Construction
   - prototype reference derivatives: worn photo at 280/567 px (never upscaled) and flat lay at 560/1120 px
   - logo PNG/WebP at 1×/2×/3×, favicon crops (32, 180, 512 PNG plus SVG from the vector), OG image 1200×630
8. **Inspect** at 100% and 200% (`docs/pipeline/*`).

## 8. Mitten geometry assumptions

The values below are the ones used in `scripts/imgpipe/mitten.py` and are repeated in HANDOFF.

- **Continuity.** The mitten continues from the existing charcoal rib-knit wrist section in the same knit. Pixels left of x = 3200 are untouched, which keeps the fleece-to-knit seam and its light topstitching (x ≈ 3045) original.
- **Length.** Wrist seam to fingertip is **0.35 ×** the fleece body length. The fleece body runs from the cuff seam at x ≈ 620 to the wrist seam at x ≈ 2960, so 2340 px, which gives 819 px. The existing knit section is 658 px, so the mitten adds about 160 px. This is the top of the brief's 0.3–0.35 range, chosen because the existing knit already reaches the knuckles.
- **Finger chamber.** One enclosed chamber. It narrows by 7.5% before the tip, then closes over the last 240 px with a superellipse (p = 2.3). Its ribs converge toward the tip by at most 1.56×. The silhouette's top and bottom edges keep the photographed knit's own waviness.
- **Thumb.** A separate chamber on the **bottom** edge of the flat lay, the side opposite the strap, matching the worn photo where the thumb exits on the side away from the strap.
  - It leaves the hand at **60%** of the knit section's length from the wrist seam.
  - It is angled **38°** from the hand axis toward the fingertips.
  - It measures about **330 px** from its base point inside the hand edge to the tip, and about **176 px** across, tapering 7%.
  - It has a rounded tip and is joined to the hand with a filleted crotch.
  - Its ribs run along its own length.
- **Exclusions.** No fold-back flap, opening, zipper or removable part. The knit colour is assumed to match the existing wrist section.

## 9. Visual QA (Phase 5)

Screenshots are in `docs/screenshots/`: 6 viewports, first viewport plus full page, plus `state-*.png` for interactions. Automated checks are in `docs/qa-report.md` (`npm run qa`, 49/49 passing).

### Scores (1–5, after iteration)

| Criterion | Score | Evidence / remaining gap |
|---|---|---|
| Product presence | 5 | The sleeve is the dominant element at every width. At 1440×1000, 1280×800, 1024×768 and 768×1024 the whole sleeve, mitten included, sits in the first viewport. On mobile, copy comes first as specified, then the vertical sleeve; its mitten is never cropped. |
| Truthfulness of visual | 4 | The mitten continues the photographed knit at the same scale, light and colour, and every instance carries a "proposed" caption. At 200% the re-synthesized rib is slightly more regular than the photographed one, so it scores 4, not 5. |
| Brand fit | 5 | The palette comes from the logo's stops. Archivo semi-expanded rhymes with the wordmark. The logo is untouched, on white, and its descriptor is legible (`mobile-390-header@3x.png`). |
| Typography | 4 | Headings are balanced with no single-word last lines. Two caption orphans and one bad hyphen break were fixed. Some body paragraphs end on two words. |
| Composition variety | 5 | Each section has its own structure: stacked hero, editorial split, zig-zag anatomy, spec list, split columns, reference list, accordion, form card. |
| Restraint | 4 | One motion moment and coral under 5%. The form's error colour adds a functional fifth coral use. |
| Mobile quality | 4 | Mobile has its own art-directed vertical sleeve and vertical anatomy, a 2 × 2 facts grid and a full-height menu. The vertical hero is long (~930 px at 390 wide), which is deliberate so it reads as a scroll from arm to hand. |
| Accuracy | 5 | Every claim maps to brief §2 or to a reference. The banned-term scan hits only the paediatric reference, "Can I buy it here? No" and "does not process orders". |
| Accessibility | 5 | axe finds 0 violations at 1440 and 390. Lighthouse accessibility is 100. The keyboard path, menu focus trap and return, hotspot keyboard and touch use, accordion and announced form errors are all verified. |

### Iteration log (what QA changed)

1. Hero: the body copy moved under the product so the mitten stays above the fold at 1280×800.
2. Caption orphan ("…Prototype / 2.4."): fixed with a non-breaking space.
3. Anatomy notes 1–2 had ragged title baselines: notes now stretch and number badges top-align.
4. The wrist-seam crop showed background at its edge: it was re-cropped fully inside the garment.
5. At 768 px the four anatomy columns were cramped: tablet now uses image plus dots, then a 2 × 2 list without leader lines.
6. "Arm-to- / hand coverage" was a bad break caused by `text-wrap: balance`: row titles now use normal wrapping.
7. Anchors landed 88 px too low because `scroll-padding-top` and `scroll-margin-top` both applied: kept only the latter.
8. Footer links were 38 px wide: they now have a 44 × 44 minimum.
9. Hotspot focus ring was invisible on the charcoal knit: it is now a double ring (white inner, blue outer).
10. "Sewn to the cuff" was inferred, not stated: changed to "attached at the cuff".
11. Lighthouse flags: added `robots.txt` and a 480 px vertical variant.
