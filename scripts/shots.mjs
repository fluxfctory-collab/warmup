// npm run shots — screenshots of the built site at every QA viewport.
// Captures the first viewport and the full page into docs/screenshots/.
// Builds nothing: run `npm run build` first. Starts `vite preview` itself
// unless SHOTS_URL points at a running server.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

export const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 800 },
];

// Use the pre-installed Chromium when Playwright's own download is absent.
export function launchOptions() {
  const pre = '/opt/pw-browsers/chromium';
  return fs.existsSync(pre) ? { executablePath: pre } : {};
}

export async function startServer() {
  if (process.env.SHOTS_URL) return { url: process.env.SHOTS_URL, stop: () => {} };
  const port = 4173;
  const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    cwd: root,
    stdio: 'ignore',
  });
  const url = `http://localhost:${port}/`;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return { url, stop: () => proc.kill() };
}

// load lazy images (full-page captures need them), then return to the top
export async function settle(page) {
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
  });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // every image that is rendered (not inside a display:none branch) has loaded
  const pending = () =>
    page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => !i.complete && i.getClientRects().length > 0)
        .map((i) => i.currentSrc || i.src),
    );
  for (let i = 0; i < 80; i++) {
    if ((await pending()).length === 0) break;
    await page.waitForTimeout(250);
  }
  const left = await pending();
  if (left.length) console.warn('images still loading:', left);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const server = await startServer();
  const browser = await chromium.launch(launchOptions());
  const only = process.argv[2];
  try {
    for (const vp of viewports) {
      if (only && !vp.name.includes(only)) continue;
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await settle(page);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-first-viewport.png`) });
      await page.screenshot({ path: path.join(outDir, `${vp.name}-full.png`), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      console.log(`${vp.name}: captured (horizontal overflow ${overflow}px)`);
      await ctx.close();
    }
    // logo legibility at a real phone pixel density
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(outDir, 'mobile-390-header@3x.png'), clip: { x: 0, y: 0, width: 390, height: 80 } });
    await ctx.close();
  } finally {
    await browser.close();
    server.stop();
  }
}
