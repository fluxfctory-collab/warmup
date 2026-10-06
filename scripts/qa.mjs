// npm run qa — automated checks against the built site (run `npm run build`
// first). Writes docs/qa-report.md and exits non-zero if a check fails.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { launchOptions, startServer, viewports } from './shots.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const server = await startServer();
const browser = await chromium.launch(launchOptions());

async function open(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, ...opts });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto(server.url, { waitUntil: 'networkidle' });
  // the GSAP hero entrance (src/motion/useHeroIntro.ts) runs for ~1.9 s
  await page.waitForFunction(() => document.documentElement.classList.contains('intro-ready'));
  await page.waitForTimeout(opts.reducedMotion === 'reduce' ? 200 : 2000);
  return { ctx, page, logs };
}

// scroll through with instant jumps so every scroll reveal fires (the page
// itself scrolls smoothly, which would make rapid scrollTo calls cancel)
async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 70));
    }
  });
  await page.waitForTimeout(800);
}

try {
  // 1. layout: no horizontal scrolling, no console errors, at every viewport
  for (const vp of viewports) {
    const { ctx, page, logs } = await open(vp);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`no horizontal scroll at ${vp.width}×${vp.height}`, overflow <= 0, `scrollWidth − clientWidth = ${overflow}px`);
    // mitten fully visible in the hero image box at this width
    const box = await page.evaluate(() => {
      const img = document.querySelector('#top picture img');
      const r = img.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width, vw: document.documentElement.clientWidth, src: img.currentSrc };
    });
    ok(`hero image inside viewport at ${vp.width}`, box.left >= 0 && box.right <= box.vw + 0.5, `${Math.round(box.left)}–${Math.round(box.right)} of ${box.vw}px, ${box.src.split('/').pop()}`);
    ok(`no console errors at ${vp.width}`, logs.length === 0, logs.join(' | '));
    await ctx.close();
  }

  // 2. axe (WCAG 2.x A/AA + best practice) on desktop and mobile, with
  //    interactive states opened so their content is scanned too
  for (const vp of [viewports[0], viewports[4]]) {
    const { ctx, page } = await open(vp);
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
    await scrollThrough(page);
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    await page.waitForTimeout(600);
    await page.locator('#faqs button[aria-expanded]').first().click();
    await page.locator('#contact button[type="submit"]').click();
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const minor = res.violations.filter((v) => !(v.impact === 'serious' || v.impact === 'critical'));
    ok(
      `axe: no serious/critical violations at ${vp.width}`,
      serious.length === 0,
      serious.map((v) => `${v.id} (${v.nodes.length})`).join(', ') ||
        `${res.passes.length} rules passed; minor: ${minor.map((v) => `${v.id}(${v.impact})`).join(', ') || 'none'}`,
    );
    await ctx.close();
  }

  // 3. structure
  {
    const { ctx, page } = await open(viewports[0]);
    const s = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => Number(h.tagName[1])),
      landmarks: ['header', 'nav', 'main', 'footer'].every((t) => document.querySelector(t)),
      imgs: Array.from(document.images).map((i) => ({ alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), lazy: i.loading, src: i.getAttribute('src') })),
      title: document.title,
      skip: !!document.querySelector('a.skip-link[href="#main"]'),
    }));
    let skips = 0;
    for (let i = 1; i < s.headings.length; i++) if (s.headings[i] - s.headings[i - 1] > 1) skips++;
    ok('single h1', s.h1 === 1, `${s.h1} found`);
    ok('heading levels never skip', skips === 0, s.headings.join(''));
    ok('landmarks + skip link present', s.landmarks && s.skip);
    ok('every <img> has alt, width and height', s.imgs.every((i) => i.alt !== null && i.w && i.h), `${s.imgs.length} images`);
    const hero = s.imgs[1];
    ok('hero image is eager; others lazy', s.imgs.filter((i) => i.lazy === 'eager').length <= 3 && hero.lazy === 'eager');
    ok('document title', s.title === 'WARMUP Vein Enhancer Sleeve | Arm and hand warming sleeve', s.title);
    await ctx.close();
  }

  // 4. anchors clear the sticky header
  {
    const { ctx, page } = await open(viewports[0]);
    for (const id of ['product', 'details', 'research', 'faqs', 'contact']) {
      await page.locator(`header nav a[href="#${id}"]`).first().click();
      await page.waitForTimeout(900);
      const r = await page.evaluate((id) => {
        const h = document.querySelector('header').getBoundingClientRect().bottom;
        const t = document.getElementById(id).getBoundingClientRect().top;
        return { h, t, atEnd: Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight };
      }, id);
      ok(`anchor #${id} lands below the sticky header`, r.t >= r.h - 1 && (r.t <= r.h + 24 || r.atEnd), `header bottom ${Math.round(r.h)}, target top ${Math.round(r.t)}`);
    }
    const sh = await page.evaluate(() => document.querySelector('header').getAttribute('data-scrolled'));
    ok('header gains its scrolled state after scrolling', sh === 'true');
    await ctx.close();
  }

  // 5. mobile menu: open, focus inside, Esc closes, focus returns, scroll lock
  {
    const { ctx, page } = await open(viewports[4]);
    const btn = page.locator('header button[aria-controls="mobile-menu"]');
    await btn.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => ({
      expanded: document.querySelector('header button[aria-controls]').getAttribute('aria-expanded'),
      visible: !document.getElementById('mobile-menu').hidden,
      focusInPanel: document.getElementById('mobile-menu').contains(document.activeElement),
      locked: document.body.classList.contains('is-locked'),
    }));
    ok('mobile menu opens with focus inside and scroll locked', st.expanded === 'true' && st.visible && st.focusInPanel && st.locked, JSON.stringify(st));
    // Tab cycles within the menu
    for (let i = 0; i < 7; i++) await page.keyboard.press('Tab');
    const trapped = await page.evaluate(() => {
      const a = document.activeElement;
      return document.getElementById('mobile-menu').contains(a) || a.getAttribute('aria-controls') === 'mobile-menu';
    });
    ok('focus stays within the open menu', trapped);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({
      expanded: document.querySelector('header button[aria-controls]').getAttribute('aria-expanded'),
      hidden: document.getElementById('mobile-menu').hidden,
      focusBack: document.activeElement === document.querySelector('header button[aria-controls]'),
      locked: document.body.classList.contains('is-locked'),
    }));
    ok('Esc closes the menu and returns focus', after.expanded === 'false' && after.hidden && after.focusBack && !after.locked, JSON.stringify(after));
    // a link closes the menu and navigates
    await btn.click();
    await page.locator('#mobile-menu a[href="#research"]').click();
    await page.waitForTimeout(900);
    const nav = await page.evaluate(() => ({ hidden: document.getElementById('mobile-menu').hidden, top: document.getElementById('research').getBoundingClientRect().top }));
    ok('menu link navigates and closes the menu', nav.hidden && nav.top < 140 && nav.top >= 70, JSON.stringify(nav));
    await ctx.close();
  }

  // 6. hotspots: mouse, keyboard, touch
  {
    const { ctx, page } = await open(viewports[0]);
    const dot = page.locator('#details [class*="stageH"] button[aria-label^="4"]');
    await dot.scrollIntoViewIfNeeded();
    await dot.click();
    const m = await page.evaluate(() => ({
      dot: document.querySelector('#details [class*="stageH"] button[aria-label^="4"]').getAttribute('aria-pressed'),
      note: document.querySelectorAll('#details ol button')[3].getAttribute('aria-pressed'),
    }));
    ok('hotspot click highlights the pair (mouse)', m.dot === 'true' && m.note === 'true', JSON.stringify(m));
    await page.locator('#details ol button').nth(1).focus();
    await page.keyboard.press('Enter');
    const k = await page.evaluate(() => ({
      note: document.querySelectorAll('#details ol button')[1].getAttribute('aria-pressed'),
      dot: document.querySelector('#details [class*="stageH"] button[aria-label^="2"]').getAttribute('aria-pressed'),
      prev: document.querySelectorAll('#details ol button')[3].getAttribute('aria-pressed'),
    }));
    ok('note activation by keyboard highlights the pair', k.note === 'true' && k.dot === 'true' && k.prev === 'false', JSON.stringify(k));
    await page.keyboard.press('Space');
    const k2 = await page.evaluate(() => document.querySelectorAll('#details ol button')[1].getAttribute('aria-pressed'));
    ok('pressing again clears the highlight', k2 === 'false');
    await ctx.close();

    const t = await open(viewports[4], { hasTouch: true, isMobile: true });
    const tdot = t.page.locator('#details [class*="stageV"] button[aria-label^="3"]');
    await tdot.scrollIntoViewIfNeeded();
    await tdot.tap();
    const tt = await t.page.evaluate(() => document.querySelectorAll('#details ol button')[2].getAttribute('aria-pressed'));
    ok('hotspot tap highlights the pair (touch, 390px)', tt === 'true');
    // hotspot positions stay on their features: compare to the image box
    const inside = await t.page.evaluate(() => {
      const st = document.querySelector('#details [class*="stageV"]');
      const r = st.querySelector('img').getBoundingClientRect();
      return Array.from(st.querySelectorAll('button')).every((b) => {
        const br = b.getBoundingClientRect();
        const cx = br.left + br.width / 2, cy = br.top + br.height / 2;
        return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;
      });
    });
    ok('mobile hotspots sit inside the vertical image', inside);
    await t.ctx.close();
  }

  // 7. accordion
  {
    const { ctx, page } = await open(viewports[0]);
    const q = page.locator('#faqs button[aria-expanded]').nth(5);
    await q.scrollIntoViewIfNeeded();
    const panelId = await q.getAttribute('aria-controls');
    const before = await page.locator(`#${panelId}`).isVisible();
    await q.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
    const exp = await q.getAttribute('aria-expanded');
    const after = await page.locator(`#${panelId}`).isVisible();
    ok('accordion opens by keyboard and shows its answer', !before && exp === 'true' && after);
    await q.click();
    await page.waitForTimeout(350);
    ok('accordion closes again', (await q.getAttribute('aria-expanded')) === 'false' && !(await page.locator(`#${panelId}`).isVisible()));
    await ctx.close();
  }

  // 8. contact form: validation, focus, honest unconnected message
  {
    const { ctx, page } = await open(viewports[0]);
    const submit = page.locator('#contact button[type="submit"]');
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    const v = await page.evaluate(() => ({
      invalid: Array.from(document.querySelectorAll('#contact [aria-invalid="true"]')).map((e) => e.name),
      focused: document.activeElement?.name,
      described: Array.from(document.querySelectorAll('#contact [aria-invalid="true"]')).every((e) =>
        (e.getAttribute('aria-describedby') || '').split(' ').some((id) => document.getElementById(id)?.textContent),
      ),
      status: document.querySelector('#contact [role="status"]').textContent,
    }));
    ok('empty submit flags required fields and focuses the first', v.invalid.join() === 'name,email,message' && v.focused === 'name' && v.described, JSON.stringify(v));
    await page.fill('#contact input[name="name"]', 'Test Nurse');
    await page.fill('#contact input[name="email"]', 'not-an-email');
    await page.fill('#contact textarea', 'Requesting product information for our unit.');
    await submit.click();
    const e2 = await page.evaluate(() => Array.from(document.querySelectorAll('#contact [aria-invalid="true"]')).map((e) => e.name));
    ok('invalid email is caught', e2.join() === 'email', e2.join());
    await page.fill('#contact input[name="email"]', 'nurse@hospital.org');
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST') posted = true;
    });
    await submit.click();
    await page.waitForTimeout(300);
    const msg = await page.locator('#contact [role="status"]').innerText();
    ok(
      'valid submit shows the honest "not connected" message and sends nothing',
      /isn.t connected yet, so your message was not sent/.test(msg) && !/sent\.$/.test(msg.replace('not sent.', '')) && !posted,
      msg.trim(),
    );
    await ctx.close();
  }

  // 9. touch targets ≥ 44×44 on mobile (inline text links exempt, WCAG 2.5.8)
  {
    const { ctx, page } = await open(viewports[4]);
    await page.locator('header button[aria-controls]').click();
    const small = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('a, button, input, textarea').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const inline = el.tagName === 'A' && el.closest('p') && getComputedStyle(el).display === 'inline';
        if (el.classList.contains('skip-link') || inline) return;
        if (r.width < 44 - 0.5 || r.height < 44 - 0.5) out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.name || '').trim().slice(0, 24)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      });
      return out;
    });
    ok('touch targets ≥ 44×44 px at 390px', small.length === 0, small.join('; '));
    await ctx.close();
  }

  // 10. no-JS reading: prerendered content and FAQ answers are readable
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(server.url);
    const r = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent,
      sections: document.querySelectorAll('main section').length,
      faqVisible: Array.from(document.querySelectorAll('#faqs [role="region"]')).every((p) => p.offsetHeight > 0),
    }));
    ok('page is readable without JavaScript (prerendered, FAQ answers visible)', r.h1 === 'Comfort begins with warmth.' && r.sections >= 8 && r.faqVisible, JSON.stringify(r));
    await ctx.close();
  }

  // 12. refinement checks: hero clarity, one navy chapter, compact research,
  //     collapsed prototype references, scroll reveal and reduced motion
  {
    const { ctx, page } = await open({ width: 1440, height: 900 });
    const h = await page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight;
      };
      const desc = Array.from(document.querySelectorAll('#top p')).find((p) => p.textContent.trim() === 'Arm-and-hand warming sleeve');
      const ctas = Array.from(document.querySelectorAll('#top a')).map((a) => a.textContent.trim());
      const img = document.querySelector('#top picture img').getBoundingClientRect();
      const plate = document.querySelector('#top figure').getBoundingClientRect();
      const cap = document.getElementById('hero-caption');
      return {
        descriptorVisible: !!desc && vis(desc),
        ctas,
        ctasVisible: Array.from(document.querySelectorAll('#top a')).every(vis),
        imgBottom: Math.round(img.bottom),
        imgWidth: Math.round(img.width),
        plateBottom: Math.round(plate.bottom),
        captionVisible: vis(cap) && /Proposed design visualization/.test(cap.textContent),
      };
    });
    ok('hero (1440×900): descriptor, both actions, the whole product plate and its caption are in the first viewport',
      h.descriptorVisible && h.ctasVisible && h.ctas.includes('Explore the sleeve') && h.ctas.includes('View the research') && h.plateBottom <= 900 && h.captionVisible,
      JSON.stringify(h));
    const dark = await page.evaluate(() => {
      const lum = (c) => {
        const m = c.match(/\d+(\.\d+)?/g);
        if (!m) return 1;
        const [r, g, b] = m.slice(0, 3).map(Number).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      return Array.from(document.querySelectorAll('main > section')).filter((s) => {
        const bg = getComputedStyle(s).backgroundColor;
        return bg !== 'rgba(0, 0, 0, 0)' && lum(bg) < 0.1;
      }).map((s) => s.getAttribute('aria-labelledby'));
    });
    ok('exactly one deep navy section (construction)', dark.length === 1 && dark[0] === 'construction-title', dark.join());
    const tags = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#construction-title ~ * li figure, section[aria-labelledby="construction-title"] li figure')).map((f) => ({
        alt: f.querySelector('img').alt.slice(0, 40),
        tag: f.querySelector('figcaption').textContent.trim(),
      })),
    );
    ok('construction close-ups say what they are (3 photographs, the mitten a visualization)',
      tags.length === 4 && tags.filter((t) => t.tag.startsWith('Photograph')).length === 3 && /Proposed visualization/.test(tags[3].tag) && /visualization/i.test(tags[3].alt),
      JSON.stringify(tags.map((t) => t.tag)));
    const research = await page.evaluate(() => Math.round(document.getElementById('research').getBoundingClientRect().height));
    ok('research section is compact by default (< 1200px tall at 1440; 1875px two rounds ago)', research < 1200, `${research}px`);
    const refs = await page.evaluate(() => {
      const d = document.querySelector('#details details');
      return { open: d.open, imgsVisibleClosed: Array.from(d.querySelectorAll('img')).some((i) => i.checkVisibility()) };
    });
    const summary = page.locator('#details details summary');
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const refsOpen = await page.evaluate(() => {
      const d = document.querySelector('#details details');
      return { open: d.open, figs: Array.from(d.querySelectorAll('figure')).map((f) => f.querySelector('figcaption').textContent) };
    });
    ok('prototype references are collapsed by default and open by keyboard',
      !refs.open && !refs.imgsVisibleClosed && refsOpen.open && refsOpen.figs.length === 2 && refsOpen.figs.every((c) => /Prototype 2\.4/.test(c)),
      JSON.stringify(refsOpen.figs));
    const disc = page.locator('#research details summary').first();
    await disc.scrollIntoViewIfNeeded();
    await disc.click();
    const discOpen = await page.evaluate(() => document.querySelector('#research details').open);
    ok('research "full citation" disclosure opens', discOpen);
    // scroll reveal: after scrolling through, nothing stays hidden
    await page.evaluate(async () => {
      // instant jumps (the page itself scrolls smoothly, which would make
      // rapid scrollTo calls cancel each other)
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 70));
      }
    });
    await page.waitForTimeout(700);
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-reveal]')).filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length,
    );
    ok('scroll reveal: every revealed block is fully visible after scrolling', hidden === 0, `${hidden} still hidden`);
    await ctx.close();

    const rm = await open({ width: 1440, height: 900 }, { reducedMotion: 'reduce' });
    const rmHidden = await rm.page.evaluate(() => ({
      hidden: Array.from(document.querySelectorAll('[data-reveal], [data-intro], [data-intro-label]')).filter((e) => {
        const cs = getComputedStyle(e);
        return Number(cs.opacity) < 0.99 || cs.visibility === 'hidden';
      }).length,
      transformed: Array.from(document.querySelectorAll('[data-reveal], [data-intro], [data-intro-product], [data-intro-line]')).filter((e) => e.style.transform).length,
    }));
    ok('prefers-reduced-motion: no entrance, no reveal hiding, no transforms', rmHidden.hidden === 0 && rmHidden.transformed === 0, JSON.stringify(rmHidden));
    await rm.ctx.close();
  }

  // 13. motion: the hero entrance finishes cleanly; keyboard focus never skips
  //     content that is still waiting to be revealed
  {
    const { ctx, page, logs } = await open({ width: 1440, height: 900 });
    const intro = await page.evaluate(() => ({
      ready: document.documentElement.classList.contains('intro-ready'),
      left: Array.from(document.querySelectorAll('[data-intro], [data-intro-label], [data-intro-product], [data-intro-line]')).filter((e) => {
        const cs = getComputedStyle(e);
        return Number(cs.opacity) < 0.99 || cs.visibility === 'hidden' || e.style.transform;
      }).length,
    }));
    ok('hero entrance completes and hands every element back to CSS', intro.ready && intro.left === 0, JSON.stringify(intro));
    const expected = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main a[href], main button, main input, main textarea, main summary'))
        .filter((e) => e.getClientRects().length && !e.closest('[hidden]') && !e.closest('details:not([open]) > :not(summary)'))
        .map((e) => e.outerHTML.slice(0, 60)),
    );
    const seen = new Set();
    let researchOpacity = null;
    for (let i = 0; i < expected.length + 12; i++) {
      await page.keyboard.press('Tab');
      const cur = await page.evaluate(() => (document.activeElement && document.querySelector('main').contains(document.activeElement) ? document.activeElement.outerHTML.slice(0, 60) : null));
      if (cur) seen.add(cur);
      // the first control reached in the research list was still waiting to
      // be revealed when focus arrived: it must become visible right away
      if (researchOpacity === null && (await page.evaluate(() => !!document.activeElement?.closest('#research li[data-reveal]')))) {
        await page.waitForTimeout(450);
        researchOpacity = await page.evaluate(() => Number(getComputedStyle(document.activeElement.closest('[data-reveal]')).opacity));
      }
    }
    const skipped = expected.filter((e) => !seen.has(e));
    ok('Tab reaches every control in <main>, including ones not yet revealed', skipped.length === 0, skipped.length ? skipped.slice(0, 3).join(' | ') : `${expected.length} controls`);
    ok('a control that receives focus is revealed at once', researchOpacity !== null && researchOpacity > 0.99, `opacity ${researchOpacity}`);
    ok('no console errors during motion and keyboard use', logs.length === 0, logs.join(' | '));
    await ctx.close();
  }

  // 11. content verification (brief §10): list every hit for manual review
  {
    const { ctx, page } = await open(viewports[0]);
    // textContent (not innerText) so collapsed FAQ answers are scanned too
    const text = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const parts = [];
      while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('script,style')) parts.push(walker.currentNode.textContent);
      return parts.join(' ') + '\n' + Array.from(document.images).map((i) => i.alt).join('\n') + '\n' + document.title + '\n' + document.querySelector('meta[name=description]').content;
    });
    const terms = ['%', '°', 'FDA', 'clinically', 'proven', 'guarantee', 'pain', 'success', 'children', 'child', 'sterile', 'buy', 'price', 'order', 'leg', 'foot', 'feet', 'compression', 'electric', 'battery', 'tourniquet', 'patent', 'certif'];
    const hits = [];
    for (const t of terms) {
      const re = new RegExp(t.length <= 3 && /\w/.test(t) ? `\\b${t}\\b` : t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let m;
      while ((m = re.exec(text))) hits.push(`"${t}": …${text.slice(Math.max(0, m.index - 50), m.index + 50).replace(/\s+/g, ' ')}…`);
    }
    const numbers = [...text.matchAll(/\b\d[\d,.–-]*\b/g)].map((m) => m[0]);
    fs.writeFileSync(path.join(root, '.cache', 'content-hits.txt'), hits.join('\n') + '\n\nNUMBERS: ' + numbers.join(' ') + '\n');
    ok('content scan written for review (.cache/content-hits.txt)', true, `${hits.length} term hits, numbers: ${[...new Set(numbers)].join(' ')}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}

const failed = results.filter((r) => !r.pass);
const md = [
  '# QA report',
  '',
  `Generated by \`npm run qa\` on ${new Date().toISOString().slice(0, 10)} against the production build (\`vite preview\`), Chromium ${'(Playwright)'}.`,
  '',
  '| Result | Check | Detail |',
  '|---|---|---|',
  ...results.map((r) => `| ${r.pass ? 'pass' : '**FAIL**'} | ${r.name} | ${String(r.detail).replace(/\|/g, '\\|').slice(0, 300)} |`),
  '',
  `${results.length - failed.length} of ${results.length} checks passed.`,
  '',
].join('\n');
fs.writeFileSync(path.join(root, 'docs', 'qa-report.md'), md);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
