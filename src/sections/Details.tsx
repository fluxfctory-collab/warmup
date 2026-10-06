import { useRef, useState } from 'react';
import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, anatomy, captions, details } from '../content/product';
import type { FeatureKey } from '../content/product';
import { MOTION_OK, gsap, motion, useGSAP } from '../motion/gsap';
import styles from './Details.module.css';

// leader lines grow out of their marker: up-lines from the bottom, down-lines from the top
const lineOrigin = (el: Element) => ((el as HTMLElement).dataset.dir === 'up' ? '50% 100%' : '50% 0%');

/**
 * Product anatomy. Four numbered hotspots (the numbers key dots to notes),
 * ordered along the sleeve from upper arm to hand. On desktop, notes 1–2 sit
 * above the image and 3–4 below, so leader lines rise or drop vertically and
 * never cross each other or text. Everything is visible without interaction;
 * dots and note titles are buttons with aria-pressed, and the selected
 * feature gets a subtle outline on the image.
 *
 * Motion (GSAP, only when motion is allowed): the leader lines draw out from
 * their markers once, when the diagram scrolls into view, and activating a
 * feature gives its marker a single gentle pulse and redraws its line.
 */
export function Details() {
  const [pressed, setPressed] = useState<FeatureKey | null>(null);
  const [hovered, setHovered] = useState<FeatureKey | null>(null);
  const shown = hovered ?? pressed;
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>('[data-leader]', root.current);
        gsap.from(lines, {
          scaleY: 0,
          transformOrigin: (_: number, el: Element) => lineOrigin(el),
          duration: motion.slow,
          ease: motion.easeLine,
          stagger: 0.12,
          clearProps: 'transform',
          scrollTrigger: { trigger: stage.current, start: 'top 72%', once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // gentle, one-off emphasis; created after mount, so wrapped in contextSafe
  const emphasize = contextSafe((key: FeatureKey) => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    const q = gsap.utils.selector(root);
    gsap.fromTo(
      q(`[data-dot="${key}"]`),
      { scale: 1 },
      { scale: 1.14, duration: 0.16, ease: 'power1.out', yoyo: true, repeat: 1, overwrite: true, clearProps: 'transform' },
    );
    q(`[data-leader="${key}"]`).forEach((line) =>
      gsap.fromTo(
        line,
        { scaleY: 0, transformOrigin: lineOrigin(line) },
        { scaleY: 1, duration: 0.5, ease: motion.easeLine, overwrite: true, clearProps: 'transform' },
      ),
    );
  });

  const toggle = (k: FeatureKey) => {
    if (pressed !== k) emphasize(k);
    setPressed((cur) => (cur === k ? null : k));
  };

  const overlay = (vertical: boolean) => (
    <>
      {anatomy.map((f) => {
        const b = (vertical ? images.boxesVertical : images.boxes)[f.key];
        return (
          <span
            key={`o-${f.key}`}
            aria-hidden="true"
            className={styles.outline}
            data-key={f.key}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
          />
        );
      })}
      {anatomy.map((f, i) => {
        const p = (vertical ? images.hotspotsVertical : images.hotspots)[f.key];
        return (
          <button
            key={f.key}
            type="button"
            className={styles.dot}
            data-key={f.key}
            data-dot={f.key}
            aria-pressed={pressed === f.key}
            aria-label={`${i + 1}: ${f.title}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onClick={() => toggle(f.key)}
            onMouseEnter={() => setHovered(f.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={styles.marker} aria-hidden="true">
              {i + 1}
            </span>
          </button>
        );
      })}
    </>
  );

  return (
    <section id="details" ref={root} className={styles.section} aria-labelledby="details-title">
      <div className={`container ${styles.head}`} data-reveal>
        <h2 id="details-title">{details.title}</h2>
        <p className={styles.intro}>{details.intro}</p>
      </div>

      <figure className={`container ${styles.anatomy}`} data-shown={shown ?? ''}>
        {/* horizontal on tablet/desktop, vertical on mobile: two boxes so the
            percentage-positioned hotspots always match the visible image */}
        <div ref={stage} className={`${styles.stage} ${styles.stageH}`}>
          <Picture
            image={images.flatlay}
            alt={alts.sleeve}
            sizes="(max-width: 1279px) calc(100vw - 80px), 1200px"
            imgClassName={styles.img}
          />
          {anatomy.map((f, i) => {
            const p = images.hotspots[f.key];
            return (
              <span
                key={f.key}
                aria-hidden="true"
                className={styles.leader}
                data-dir={i < 2 ? 'up' : 'down'}
                data-key={f.key}
                data-leader={f.key}
                style={{ left: `${p.x}%`, ['--y' as string]: `${p.y}%` }}
              />
            );
          })}
          {overlay(false)}
        </div>
        <div className={`${styles.stage} ${styles.stageV}`}>
          <Picture image={images.vertical} alt={alts.sleeve} sizes="220px" imgClassName={styles.img} />
          {overlay(true)}
        </div>

        <figcaption className={styles.caption}>
          <span className={styles.tick} aria-hidden="true" />
          {captions.proposed}
        </figcaption>

        <ol className={styles.notes}>
          {anatomy.map((f, i) => (
            <li key={f.key} className={styles.note} data-key={f.key}>
              <button
                type="button"
                className={styles.noteButton}
                aria-pressed={pressed === f.key}
                onClick={() => toggle(f.key)}
                onMouseEnter={() => setHovered(f.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={styles.noteNum} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.noteTitle}>{f.title}</span>
              </button>
              <p className={styles.noteText}>{f.text}</p>
            </li>
          ))}
        </ol>

        <p className={styles.useNote}>
          <span className={styles.useLabel}>{details.useNote.label}</span>
          {details.useNote.text}
        </p>
      </figure>

      <div className="container">
        <details className={styles.reference}>
          <summary className={styles.refSummary}>
            <span className={styles.refTitle}>{details.reference.title}</span>
            <span className={styles.refHint}>{details.reference.summary}</span>
            <span className={styles.refIcon} aria-hidden="true" />
          </summary>
          <div className={styles.refBody}>
            <p className={styles.refText}>{details.reference.text}</p>
            <figure className={styles.refFlat}>
              <Picture
                image={images.refFlatlay}
                alt={alts.refFlatlay}
                sizes="(max-width: 767px) calc(100vw - 40px), 520px"
                imgClassName={styles.refImg}
              />
              <figcaption>{captions.refFlatlay}</figcaption>
            </figure>
            <figure className={styles.refWorn}>
              <Picture image={images.refWorn} alt={alts.refWorn} sizes="84px" imgClassName={styles.refImg} />
              <figcaption>{captions.refWorn}</figcaption>
            </figure>
          </div>
        </details>
      </div>
    </section>
  );
}
