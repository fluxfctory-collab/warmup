# Handoff: WARMUP Vein Enhancer Sleeve website

A finished, responsive, single-page information site with no commerce. Branch: `claude/funny-volta-539fmr`. Nothing has been deployed.

---

## 1. How to run it locally

```bash
npm install
npm run dev        # development server, http://localhost:5173
npm run build      # tsc typecheck → client build → SSR build → prerender into dist/
npm run preview    # serves dist/ at http://localhost:4173
npm run shots      # screenshots at 6 viewports → docs/screenshots/ (SHOTS_DIR=… to redirect; run after build)
npm run qa         # automated checks → docs/qa-report.md (run after build)
npm run images     # regenerate all images from source-assets/ (Python)
```

- **Node.** Node 20.19+ or 22.12+. Built and tested on Node 22.22.
- **Image pipeline.** It needs Python 3.10+ with `pip install -r scripts/requirements.txt` (Pillow with AVIF, NumPy, OpenCV, SciPy, fontTools, brotli) and `pdftocairo` from poppler-utils. Generated images are committed, so a normal build does not need Python.
- **Browser for checks.** `shots` and `qa` use Playwright 1.56 Chromium. They pick up `/opt/pw-browsers/chromium` if present; otherwise run `npx playwright install chromium` once.
- **Before deploying.** `og:image` is a relative URL (`/images/warmup-og.jpg`). Make it absolute once the domain is known.

## 2. Screenshots (all actually captured, in `docs/screenshots/`)

| Path | What |
|---|---|
| `before/` | The page before the art-direction refinement (section 9), at 1440×900, 1280×800, 1024×768, 768×1024, 390×844 and 360×800: first viewport plus full page for each |
| `after/` | The same set after the refinement, plus `state-*.png` interaction states (menu, hotspots, prototype references, research disclosure, FAQ, form errors and the not-connected message) and `mobile-390-header@3x.png` (logo legibility) |
| `compare-desktop-1440-hero.png` | Before and after, side by side: desktop first viewport at 1440×900 |
| `compare-desktop-1440-full.png` | Before and after, side by side: desktop full page (scaled to 50%) |

Pipeline review crops, at 100% and 200%, are in `docs/pipeline/`; `fleece-edge-200.jpg` shows the de-haloed bottom edge.

## 3. Design decisions in brief

- **Concept.** "Cool to warm, arm to hand." The logo's left-to-right blue-to-red gradient organizes the page:
  - product views put the upper arm on the left and the mitten on the right;
  - the page starts on a blue-tinted surface (hero) and ends on the only warm surface (contact);
  - anatomy notes are numbered along the sleeve from arm to hand.
- **Hero: Option 2 (stacked), chosen.** The headline and lead sit on one row, and the sleeve runs below at nearly the full viewport width, bleeding to the right edge.
  - At 1440 px the sleeve is about 1330 px long, against about 800 px for the diagonal split. That is 1.7× larger, and the mitten is never cropped.
  - The body copy sits under the product so the whole sleeve, mitten included, is in the first viewport at 1440×1000, 1280×800, 1024×768 and 768×1024.
  - Mobile uses a separate vertical export (cuff at top, mitten at bottom, thumb on the left as in the worn photo).
  - The two wireframes and the reasoning are in `DESIGN_PLAN.md` §5.
- **Palette.** The brief's tokens are used unchanged. Additions:

  | Token | Value | Use |
  |---|---|---|
  | `--line-strong` | `#C3CDDD` | Hairlines that must read on the blue surface |
  | `--blue-tint`, `--coral-tint` | 14–16% alpha | Active-marker halos |
  | Input border | `#76839A` | 3.8:1 on white, for a visible UI boundary |

  Measured contrast:

  | Pair | Ratio |
  |---|---|
  | Ink on bg | 14.6:1 |
  | Ink-2 on bg | 6.0:1 |
  | Ink-2 on the blue surface | 5.7:1 |
  | Blue on bg | 9.0:1 |
  | White on blue | 9.5:1 |
  | `--coral-text` on white | 5.4:1 |
  | `--coral` on white (borders and ticks only, never small text) | 4.0:1 |

  Coral stays under 5% of the page.
- **Typeface.** Archivo Variable (weight and width axes), self-hosted from `@fontsource-variable/archivo`. Only the latin subset is downloaded, and it is preloaded.
  - Headings: weight 720–740 at 114–116% width with tight tracking, in sentence case. This rhymes with the logo's heavy, wide wordmark without imitating it.
  - Body: weight 400 at 100% width.
- **One logo-derived detail.** Hotspot markers are rounded squares like the "UP" badge, and the active marker grows the badge's small upward notch.
- **Motion.** On load only: the headline rises, then the product settles about 120 ms later. Everything else responds only to user input. All of it is removed under `prefers-reduced-motion`.
- **Logo.** The supplied `WARM UP.png` is resized only, sits on white, at 232 px desktop and 176 px mobile (the top of the allowed range, chosen for descriptor legibility). The SVG converted from the PDF matched the PNG, with only sub-pixel edge differences (`docs/pipeline/logo-svg-diff.png`). It is used only for the favicon.
- **Favicon (design assumption).** A tight crop of the existing "UP" badge, not redrawn:
  - `favicon-32.png`;
  - `apple-touch-icon.png` (180 px on white, because iOS fills transparency with black);
  - `icon-512.png`;
  - `favicon.svg`, built from the vector PDF by keeping only the badge paths and the definitions they reference.

## 4. Mitten visual: production tier and pipeline

**Tier A, a scripted photo composite.** The steps run from `scripts/build_images.py` → `scripts/imgpipe/`:

| Step | Module | What it does |
|---|---|---|
| 1. Segment | `segment.py` | B − G after a σ = 2 px blur, thresholded at +1.5. Every sleeve material is bluish (B > G) and the mat, including its dark grid lines and the ruler, is greenish, so this keys cleanly. It then keeps the largest component, fills holes and smooths. |
| 2. Soft alpha | `segment.py` | In a ±3 px band, alpha follows the B − G ramp so fleece fibres stay soft. It is pulled in about 1 px and feathered. |
| 3. Defringe | `segment.py` | Un-premultiplies edge pixels against a locally estimated mat colour (normalized convolution), then clamps green spill in a 6 px band. Checked on a dark background (`docs/pipeline/edge-on-dark-200.jpg`). |
| 4. White balance | `segment.py` | Per-channel gains from a fleece sample, targeting about #EEE8DF, plus a gentle shadow lift (γ 0.94) and a highlight shoulder. |
| 5. Mitten | `mitten.py` | Extends the knit tube by quilting the photo's own knit along a minimum-error seam (ribs run lengthwise, so rows align). Then:<ul><li>re-synthesizes low-frequency shading from the tube's measured cross-section, which removes cloned wrinkles but keeps the rib and stitch detail;</li><li>warps into a rounded finger chamber with converging ribs and anti-aliasing;</li><li>builds a separate thumb from the same knit, rotated so its ribs follow it;</li><li>adds a filleted crotch, an occlusion crease, fibre-scale edge noise and tip edge darkening.</li></ul> |
| 6. Shadow and exports | `export.py` | Contact plus ambient shadow, horizontal and vertical exports in AVIF/WebP/PNG, detail crops, prototype references, logo sizes, favicons, the OG card, and a manifest written to `src/content/images.generated.ts` (sizes and hotspot positions). |

The composite was inspected at 100% and 200% (`docs/pipeline/mitten-100.jpg`, `mitten-tip-200.jpg`, `mitten-thumb-200.jpg`). Two problems were fixed: a starburst at the tip, and cloned wrinkles and moiré from the first pass.

**Mitten geometry assumptions.** The brief only says "add mitten", so every detail below is inferred. All of it is in flat-lay pixels at about 140 px per inch, used internally only. **No dimension is published.**

1. The mitten continues from the existing **charcoal rib-knit wrist section**, in the same knit and colour. The fleece-to-knit seam and its light topstitching are original photo pixels.
2. **Hand-section length** (wrist seam to fingertip) is **0.35 ×** the fleece body length (cuff seam to wrist seam). This is the top of the brief's 0.3–0.35 range, chosen because the existing knit section already reaches the knuckles. It extends the existing section by about 160 px.
3. **One enclosed finger chamber.** It narrows by 7.5% and then closes in a softly rounded superellipse tip, with ribs converging slightly toward the tip.
4. **A separate thumb** on the edge opposite the strap, matching the worn photo, where the thumb exits on the side away from the strap.
   - It leaves the hand at 60% of the knit section's length from the wrist seam.
   - It angles 38° toward the fingertips.
   - It is about 0.3× the hand width across and has a rounded tip.
   - Its ribs run along its own length.
5. **No** fold-back flap, opening, zipper or removable part.
6. Sleeve and mitten are presented as one continuous garment.

## 5. Which images are which

| Image | Status | Caption on the page |
|---|---|---|
| `warmup-sleeve-with-mitten-flatlay@*` (hero, anatomy, OG card) | **Proposed design visualization** (composite) | "Proposed design visualization with integrated mitten, based on Prototype 2.4." |
| `warmup-sleeve-with-mitten-vertical@*` (mobile hero, mobile anatomy) | **Proposed design visualization** (composite, rotated) | Same |
| `warmup-detail-mitten@*` (Construction, row 4) | **Proposed design visualization** (crop of the composite) | Row text: "Shown here as a proposed design visualization." The alt text says so too. |
| `warmup-detail-fleece@*`, `-strap@*`, `-pouch@*`, `-wrist-seam@*` | Prototype 2.4 photo regions, **cut out and colour-corrected only**. No mitten pixels. | Wrist seam: "Prototype 2.4 detail … Colour-corrected photograph." |
| `prototype-2-4-flatlay-original@*` | **Untouched photo** (resized only) | "Prototype 2.4, flat lay (before mitten update)." |
| `prototype-2-4-worn-original@*` | **Untouched photo** (resized only, never upscaled, shown about 94–101 CSS px wide; the brief allows up to 280) | "Prototype 2.4, worn (fingerless hand section, before mitten update)." |

## 6. Checks actually performed

| Check | Tool | Result |
|---|---|---|
| Build and typecheck | `npm run build` (tsc 5.9, Vite 7.3) | Passes, **0 type errors**. JS is 255 KB raw / 80.6 KB gzip, CSS 7 KB gzip, prerendered HTML 32.5 KB. |
| Preview | `npm run preview` | Served and exercised by all checks below |
| Automated QA | `npm run qa` (Playwright 1.56, Chromium 141) | **56 / 56 passed** after the refinement pass. Full table in `docs/qa-report.md`. |
| Accessibility scan | @axe-core/playwright 4.13 (WCAG 2.0/2.1/2.2 A and AA, plus best practice) at 1440 and 390, with the FAQ opened and form errors shown | **0 violations** of any impact |
| Horizontal overflow | `scrollWidth − clientWidth` at all 6 viewports | 0 px everywhere |
| Console errors | All 6 viewports, including hydration | None |
| Anchor navigation | Nav links to all 5 sections | Each target lands just below the sticky header |
| Mobile menu | Keyboard | Opens with focus inside, Tab is trapped, Esc closes and returns focus to the button, background scroll is locked, links navigate and close it |
| Hotspots | Mouse at 1440, keyboard (Enter and Space on the notes), touch tap at 390 | Each highlights the pair with `aria-pressed`. Mobile dots sit inside the vertical image. |
| Accordion | Keyboard and mouse | Opens and closes with `aria-expanded` |
| Contact form | Empty submit, invalid email, valid submit | Empty submit flags 3 fields, focuses the first and announces the count. Invalid email is caught. A valid submit shows "This form isn't connected yet, so your message was not sent." and **no network request is made**. |
| Touch targets | 390 px | All ≥ 44 × 44, except inline text links (WCAG 2.5.8 inline exception) |
| No-JS reading | JavaScript disabled | Full prerendered content, FAQ answers visible |
| Content verification (brief §10) | Scan of all text, including collapsed FAQ answers, alt text, title and meta | See below |
| Lighthouse 12.8.2, run locally against `vite preview` with Chromium 141 | Mobile preset | **Performance 94, Accessibility 100, Best Practices 100, SEO 100** (LCP 2.6 s, CLS 0, TBT 160 ms) |
| | Desktop preset | **100 / 100 / 100 / 100** (LCP 0.5 s, CLS 0). A previous mobile run scored Performance 96; the score varies between runs. |
| Visual review | Every screenshot opened and inspected, plus the 100% and 200% pipeline crops | Scores and iteration log in `DESIGN_PLAN.md` §9. Every line ≥ 4. |

**Content verification hits.** All are justified:
- "children" appears only in the Suchitra reference, which is flagged as a paediatric study.
- "buy" and "orders" appear only in "Can I buy it here? No … does not process orders."

Numbers on the page are limited to:
- "Prototype 2.4";
- hotspot keys 1–4;
- publication years, volume, issue and page numbers, and the correction month;
- participant counts (88, 60, 136);
- the © year.

No %, °, temperatures, timings, prices, sizes or dimensions appear.

**Not available or not done:**
- No real-device or Safari/Firefox testing; Chromium only.
- No screen-reader session (VoiceOver/NVDA). Semantics were checked by axe and by inspection.
- **Research links could not be opened from this environment.** Its network policy blocks `pubmed.ncbi.nlm.nih.gov`, `api.crossref.org`, the BMC journal site, `ons.org` and `thieme-connect.de`. I corroborated each reference instead through web-search results that index those publisher and PMC pages: titles, authors, journal, volume and pages, design, population, the Yasuda correction and its content. See section 8.

## 7. Open items for the client

1. **Contact method.** No email, phone or address was supplied. Set `src/config/contact.ts` → `endpoint`, or tell us the preferred channel. Until then the form honestly says it is not connected.
2. **Mitten design.** Please confirm:
   - the integrated mitten as shown: knit continuing from the wrist, separate thumb, no opening or flap;
   - its knit colour (assumed to match the charcoal wrist section);
   - the thumb side and position;
   - the length assumption (section 4).
3. **Pouches.** The brief says "pouches" but Prototype 2.4 shows one. Confirm the number and placement. The anatomy annotates only the visible pouch, while body copy uses the plural.
4. **Materials.** "High-quality fleece and cotton" is shown as the maker's description. Confirm which parts are cotton (for example, whether the knit is a cotton rib).
5. **Legal and regulatory wording.** No regulatory status, certifications or claims are made. Add any wording you need: intended-use statement, single-patient-use labelling, care or disposal guidance.
6. **Photography.** Replace the proposed visualization with real photography once a mitten prototype exists. The pipeline can re-cut a new flat lay shot on the same mat.
7. **Reference check.** Please click each research link once from a normal network before launch (see section 6).
8. **Domain.** Needed for an absolute `og:image` URL.

## 8. References: kept, dropped, verification

No reference was dropped. All four from the client document are listed, newest first. Each summary describes design and population only, with no results, temperatures, timings or percentages.

- **Yasuda 2023.** Population confirmed as 88 healthy female volunteers. The Feb 2024 correction (doi 10.1186/s40101-024-00357-4) swapped p-values in Table 4. The site's summary uses no results, so it is unaffected; the correction is linked and mentioned.
- **Suchitra 2020.** Labelled "This is a paediatric study". Nothing implies WARMUP suits children. The study's heating method is deliberately not named, so nothing suggests electrical heating.
- **Jisha 2017.** Published in *Nitte University Journal of Health Science* 7(3), now *Journal of Health and Allied Sciences NU* (Thieme DOI). The study's hot-water-bag and moist-towel temperatures are deliberately omitted.
- **Fink 2009.** RCT in 136 hematology-oncology outpatients. Outcomes are listed by name only.

The scope note under the heading reads: "These studies look at warming methods before venous access. None of them evaluated the WARMUP sleeve."

**Caveat.** Per the brief's rule ("if any link fails to resolve, drop that entry"), I did not observe any link failing, but I also could not load any of them directly from this sandbox. The URLs are the canonical DOI and PubMed URLs from the brief, plus the jhas-nu.in article page. Search results show that page and all the publisher pages exist.

## 9. Art-direction refinement pass

Principle: "clinical precision with textile warmth". The page's facts, references and mitten visual are unchanged; the changes are composition, staging and hierarchy.

| Area | Change |
|---|---|
| Palette | Cool neutral `#F8FAFD`, pale blue `#EDF3FC`, pale warm `#FFF4EF`, plus one deep navy `#102446` chapter. Navy text tokens: white and `#C5CDDC` (about 9.9:1). |
| Hero | Headline upper-left; a blue **"Arm-and-hand warming sleeve"** descriptor, short copy and the actions **Explore the Sleeve** / **View the Research** upper-right; the complete sleeve beneath on a faint white → pale-blue field with a low-saturation warm patch behind the mitten (no glow, no heat map); a compact four-item feature strip. At 1440×900 the descriptor, both actions and the whole sleeve with mitten sit in the first viewport (checked by `npm run qa`). |
| Image staging | A thin bright rim along the fleece edge, visible at 2× density, came from edge un-premultiplying. The pipeline now clamps edge colours to the nearby interior colour (`scripts/imgpipe/segment.py`), which removed it (`docs/pipeline/fleece-edge-200.jpg`). Mitten geometry and pixels are unchanged. |
| Introduction | Shorter: three labelled statements (what it is, when it is used, how it holds warmth) beside the wrist-seam detail in a shared image frame. |
| Anatomy | Pale-blue chapter. Selecting a number or note now also outlines that feature on the image (blue, coral for the mitten). "Intended use" is a separate unnumbered note, not a hotspot. |
| Prototype references | Collapsed by default into a native `<details>` labelled "Prototype references", with captions stating they are original photographs taken before the mitten update. |
| Construction | The page's one deep navy section: heading, a large real-photo detail (strap with hook-and-loop strip, cuff patch, pouch slot; no mitten pixels), and four rows with small custom line icons drawn from the sleeve's parts. Coral marks only the mitten row. |
| Clinical | Compact: heading row, then blood draw (A), peripheral IV (B) and a distinct same-patient reuse note. |
| Research | 1,875 px → about 1,080 px at 1440. Each study shows year, a short accurate label, first author and journal, one sentence on design and population, and one **Source** link (DOI). The full title, all authors, citation, longer summary and every link sit in a "Full citation and details" disclosure. The "None of them evaluated the WARMUP sleeve" note stays beside the heading. No reference was removed. |
| FAQ | Hairline rows, larger questions, plus/minus control, and the open row becomes a pale-blue panel. Copy unchanged. |
| Contact | Invitation and form balanced. Two notes beside the form: professional enquiries only (no patient information), and that the form is a demo and not connected. The not-connected message is unchanged and no request is sent. |
| Footer | Unchanged structure; descriptor shortened so logo, line and links align on the grid. |
| Motion | One restrained scroll reveal (440 ms fade and 14 px rise, once, via IntersectionObserver). Content already on screen is never hidden; nothing is hidden without JavaScript or under `prefers-reduced-motion`. |

**New QA checks** (all passing): hero clarity at 1440×900; exactly one navy section; research shorter than 1,200 px; prototype references collapsed and keyboard-openable; research disclosure opens; nothing left hidden after scrolling; reduced motion hides nothing. axe still reports **0 violations** at 1440 and 390, with every disclosure opened during the scan.

**Visual limitations.** No arm-worn photo of the mitten version exists and no image-generation tool is configured here, so the clinical section uses typography rather than a worn visual; no bedside or needle imagery was invented. The rendered mitten is still the proposed visualization from Prototype 2.4.
