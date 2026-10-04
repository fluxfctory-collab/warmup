import type { ReactNode } from 'react';

/**
 * Four small line icons drawn from the sleeve's own parts (1.5px stroke,
 * rounded caps). Decorative: the adjacent heading carries the meaning.
 */
type Kind = 'fleece' | 'strap' | 'pouch' | 'mitten';

const paths: Record<Kind, ReactNode> = {
  // brushed fleece: soft nap lines
  fleece: (
    <>
      <path d="M5 10c2.3-1.6 4.7-1.6 7 0s4.7 1.6 7 0 4.7-1.6 7 0" />
      <path d="M5 16c2.3-1.6 4.7-1.6 7 0s4.7 1.6 7 0 4.7-1.6 7 0" />
      <path d="M5 22c2.3-1.6 4.7-1.6 7 0s4.7 1.6 7 0 4.7-1.6 7 0" />
    </>
  ),
  // strap with a hook-and-loop strip, crossing the cuff
  strap: (
    <>
      <rect x="4" y="11" width="24" height="10" rx="3" transform="rotate(-24 16 16)" />
      <rect x="9" y="14" width="13" height="4" rx="1.2" transform="rotate(-24 16 16)" />
    </>
  ),
  // patch pouch with its bound slot
  pouch: (
    <>
      <path d="M7 8h18v13a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z" />
      <path d="M11 12.5h10" />
    </>
  ),
  // mitten: one finger chamber and a separate thumb, on a cuff
  mitten: (
    <>
      <path d="M11 27V14.5a6 6 0 0 1 12 0V27" />
      <path d="M11 19.5 7.6 16.6a2.3 2.3 0 0 0-3.3 3.1L11 26" />
      <path d="M10 27h14" />
    </>
  ),
};

export function FeatureIcon({ kind, className }: { kind: Kind; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[kind]}
    </svg>
  );
}
