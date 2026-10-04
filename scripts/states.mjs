// Screenshots of interactive states for visual QA (docs/screenshots/state-*.png).
import { chromium } from 'playwright';
import path from 'node:path';
import { launchOptions, startServer } from './shots.mjs';

const dir = process.env.SHOTS_DIR || path.join('docs', 'screenshots');
const out = (n) => path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', dir, `state-${n}.png`);
const server = await startServer();
const browser = await chromium.launch(launchOptions());
try {
  // mobile menu open
  let ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  let page = await ctx.newPage();
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await page.locator('header button[aria-controls]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out('mobile-menu-open') });
  await ctx.close();

  // desktop: active hotspot (keyboard focus on note 4), FAQ open, form errors + status
  ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await ctx.newPage();
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
  const fig = page.locator('#details figure').first();
  await fig.scrollIntoViewIfNeeded();
  await page.locator('#details ol button').nth(3).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  await fig.screenshot({ path: out('hotspot-mitten-active') });
  await page.locator('#details ol button').nth(0).click();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
  await fig.screenshot({ path: out('hotspot-strap-active') });

  const refs = page.locator('#details details');
  await refs.locator('summary').click();
  await page.waitForTimeout(400);
  await refs.screenshot({ path: out('prototype-references-open') });
  const cite = page.locator('#research li').first();
  await cite.locator('summary').click();
  await page.waitForTimeout(300);
  await cite.screenshot({ path: out('research-details-open') });

  await page.locator('#faqs button[aria-expanded]').nth(1).click();
  await page.waitForTimeout(400);
  await page.locator('#faqs').screenshot({ path: out('faq-open') });

  await page.locator('#contact button[type="submit"]').click();
  await page.waitForTimeout(300);
  await page.locator('#contact').screenshot({ path: out('form-errors') });
  await page.fill('#contact input[name="name"]', 'Jordan Lee');
  await page.fill('#contact input[name="email"]', 'jordan.lee@hospital.org');
  await page.fill('#contact textarea', 'Could you share product information for our infusion unit?');
  await page.locator('#contact button[type="submit"]').click();
  await page.waitForTimeout(300);
  await page.locator('#contact').screenshot({ path: out('form-not-connected') });
  await ctx.close();

  // touch, mobile anatomy with an active hotspot
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  page = await ctx.newPage();
  await page.goto(server.url, { waitUntil: 'networkidle' });
  const v = page.locator('#details [class*="stageV"]');
  await v.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await v.locator('button').nth(3).tap();
  await page.waitForTimeout(300);
  await v.screenshot({ path: out('mobile-hotspot-tap') });
  await ctx.close();
} finally {
  await browser.close();
  server.stop();
}
console.log('state screenshots written');
