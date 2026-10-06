import type { RefObject } from 'react';
import { MOTION_OK, SMALL, gsap, motion, useGSAP } from './gsap';

// GSAP must start before the CSS failsafe in base.css (1.6 s) reveals the
// intro on its own; later than this the visitor has already seen the final
// state, so the entrance is skipped rather than replayed.
const DEADLINE_MS = 1500;

const markReady = () => document.documentElement.classList.add('intro-ready');

/**
 * Hero entrance, about 1.4 s: descriptor and heading, supporting text, the
 * product plate (the sleeve travels a short way in the arm-to-hand
 * direction), then the actions, and finally the arm-to-hand scale line draws.
 * Transform and opacity only. Reduced motion, a late start or a failed
 * script all leave the hero in its final, readable state.
 */
export function useHeroIntro(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      // matchMedia runs a conditions handler only when one condition matches,
      // so the reduced-motion desktop case is settled here
      if (!window.matchMedia(MOTION_OK).matches) markReady();
      const mm = gsap.matchMedia();
      mm.add({ ok: MOTION_OK, small: SMALL }, (ctx) => {
        const { ok, small } = ctx.conditions as { ok: boolean; small: boolean };
        const root = document.documentElement;
        if (!ok || root.classList.contains('intro-ready') || performance.now() > DEADLINE_MS) {
          markReady();
          return;
        }
        const q = gsap.utils.selector(scope);
        // each tween hands its element back to the stylesheet when it ends
        const tl = gsap.timeline({
          defaults: { ease: motion.ease, duration: motion.base, clearProps: 'transform,opacity,visibility' },
        });
        tl.from(q('[data-intro="kicker"]'), { autoAlpha: 0, y: 10 })
          .from(q('[data-intro="title"]'), { autoAlpha: 0, y: small ? 16 : 28, duration: 0.8 }, '<0.08')
          .from(q('[data-intro="lead"]'), { autoAlpha: 0, y: 14 }, '<0.2')
          .from(q('[data-intro="plate"]'), { autoAlpha: 0, y: small ? 12 : 22, duration: motion.slow }, '<0.12')
          .from(q('[data-intro-product]'), small ? { y: -12, duration: 1.1 } : { x: -32, duration: 1.1, ease: 'power2.out' }, '<')
          .from(q('[data-intro="actions"] > *'), { autoAlpha: 0, y: 10, stagger: 0.08, duration: 0.45 }, '<0.3')
          .from(
            q('[data-intro-line]'),
            small
              ? { scaleY: 0, transformOrigin: '50% 0%', duration: 0.8, ease: motion.easeLine }
              : { scaleX: 0, transformOrigin: '0% 50%', duration: 0.8, ease: motion.easeLine },
            '<0.05',
          )
          .from(q('[data-intro-label]'), { autoAlpha: 0, stagger: 0.12, duration: motion.fast }, '>-0.35');
        markReady();
      });
      return () => mm.revert();
    },
    { scope },
  );
}
