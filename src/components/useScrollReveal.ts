import { useEffect } from 'react';

/**
 * Restrained scroll reveal for elements marked `data-reveal`: a 440 ms fade
 * and 14 px rise, once. Elements already on screen when JavaScript starts are
 * shown immediately (no flash), and nothing is hidden when JavaScript is off,
 * IntersectionObserver is missing, or the visitor prefers reduced motion.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-revealed');
    }
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );
    for (const el of els) if (!el.classList.contains('is-revealed')) io.observe(el);
    return () => io.disconnect();
  }, []);
}
