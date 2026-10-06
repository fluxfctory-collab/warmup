# WARMUP: Vein Enhancer Sleeve

A single-page informational website for the WARMUP arm-and-hand warming sleeve. It offers no commerce. The page uses Vite, React and TypeScript with plain CSS (custom properties and CSS Modules), and GSAP (with ScrollTrigger and `@gsap/react`) for a short hero entrance, section reveals and annotation emphasis. It is prerendered at build time and hydrated on the client.

## Run it

```bash
npm install          # Node 20.19+ or 22.12+
npm run dev          # http://localhost:5173 (client-rendered in dev)
npm run build        # typecheck, client build, SSR build, prerender -> dist/
npm run preview      # serve dist/ at http://localhost:4173
npm run shots        # screenshots at 6 viewports -> docs/screenshots/ (needs a build)
npm run qa           # axe + interaction + layout + content checks -> docs/qa-report.md
npm run images       # rebuild every image from source-assets/ (Python, see below)
npm run images:crops # re-export only the detail close-ups; other images stay as committed
```

`shots` and `qa` use Playwright's Chromium. If `/opt/pw-browsers/chromium` exists they use it; otherwise run `npx playwright install chromium` once.

The image pipeline needs Python 3.10+ (`pip install -r scripts/requirements.txt`) and `pdftocairo` (poppler-utils) for the SVG favicon. The generated images are committed, so the site builds without Python.

## Where things live

| Path | What |
|---|---|
| `source-assets/` | The client's files, extracted from the brief zip. **Never edited.** |
| `scripts/build_images.py`, `scripts/imgpipe/` | Repeatable product-visual pipeline: segment the mat, defringe, white-balance, build the mitten, shadow, export |
| `public/images/` | Generated web images (AVIF / WebP / PNG or JPEG) |
| `src/content/*.ts` | All copy: product, navigation, research, FAQ. `images.generated.ts` is written by the pipeline. |
| `src/config/contact.ts` | Contact form endpoint. It is `null` (not connected) until the client supplies one. |
| `src/styles/tokens.css` | Colour, type, spacing and motion tokens |
| `src/sections/` | One component and CSS module per page section |
| `src/motion/` | GSAP setup and motion hooks: hero entrance, scroll reveals. All motion sits in `gsap.matchMedia()` under `prefers-reduced-motion: no-preference` |
| `src/components/` | Picture, Logo, ButtonLink, Accordion |
| `docs/` | Asset audit, design plan, handoff, QA report, screenshots, pipeline review crops |

## Contact form

The form validates input and never pretends to send. While `contactConfig.endpoint` is `null`, a valid submission shows: "This form isn't connected yet, so your message was not sent." To connect it, set `endpoint` to a URL that accepts a JSON POST of `{ name, email, organisation, message }`.
