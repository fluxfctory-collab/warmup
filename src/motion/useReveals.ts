import { MOTION_OK, SMALL, ScrollTrigger, gsap, motion, useGSAP } from './gsap';

const restore = { clearProps: 'transform,opacity' };

/**
 * Restrained section reveals for elements marked `data-reveal`: a short fade
 * and rise, once, batched so neighbours enter with a small stagger.
 *
 * Content is never hidden by CSS. GSAP hides only elements still below the
 * fold when it starts, so nothing already on screen flashes, the prerendered
 * page reads fully without JavaScript, and reduced-motion visitors (or a
 * failed script) simply see everything. matchMedia reverts it all on change.
 *
 * Opacity, not visibility: hidden elements would drop out of the Tab order,
 * so a keyboard user could skip links that have not been scrolled to yet.
 * Focus moving into a waiting element reveals it at once.
 */
export function useReveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ ok: MOTION_OK, small: SMALL }, (ctx) => {
      const { ok, small } = ctx.conditions as { ok: boolean; small: boolean };
      if (!ok) return;
      const fold = window.innerHeight * 0.94;
      const pending = new Set(
        gsap.utils.toArray<HTMLElement>('[data-reveal]').filter((el) => el.getBoundingClientRect().top > fold),
      );
      if (!pending.size) return;
      gsap.set([...pending], { opacity: 0, y: small ? 12 : 18 });

      const show = (els: Element[], stagger = 0) => {
        els.forEach((el) => pending.delete(el as HTMLElement));
        return gsap.to(els, { opacity: 1, y: 0, duration: motion.base, ease: motion.ease, stagger, overwrite: true, ...restore });
      };

      ScrollTrigger.batch([...pending], {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          // a fast jump (End key, a far anchor) can pass many triggers at once:
          // whatever is already above the viewport is simply restored, and the
          // rest share a stagger capped at ~0.3 s so nothing on screen waits
          const passed = batch.filter((el) => el.getBoundingClientRect().bottom < 0);
          const entering = batch.filter((el) => !passed.includes(el));
          if (passed.length) {
            passed.forEach((el) => pending.delete(el as HTMLElement));
            gsap.set(passed, { overwrite: true, ...restore });
          }
          if (entering.length) show(entering, Math.min(0.08, 0.3 / entering.length));
        },
      });

      const onFocus = (e: FocusEvent) => {
        const el = (e.target as Element | null)?.closest?.('[data-reveal]');
        if (el && pending.has(el as HTMLElement)) show([el]).duration(motion.fast);
      };
      document.addEventListener('focusin', onFocus);
      return () => document.removeEventListener('focusin', onFocus);
    });
    return () => mm.revert();
  });
}
