import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register once, in the browser only: the prerender (SSR) build imports this
// module but never runs an animation.
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Every animation lives inside gsap.matchMedia() under this query, so a
 * visitor who prefers reduced motion gets the final state with no movement. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const SMALL = '(max-width: 599px)';

/** One family of eases and durations for the whole page. "power3.out" matches
 * --ease-out in tokens.css, so CSS transitions and GSAP tweens feel alike. */
export const motion = {
  ease: 'power3.out',
  easeLine: 'power2.inOut',
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
} as const;

export { gsap, ScrollTrigger, useGSAP };
