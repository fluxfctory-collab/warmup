import { useState } from 'react';
import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, anatomy, captions, details } from '../content/product';
import type { FeatureKey } from '../content/product';
import styles from './Details.module.css';

/**
 * Product anatomy. Four numbered hotspots (the numbers key dots to notes),
 * ordered along the sleeve from upper arm to hand. On desktop, notes 1–2 sit
 * above the image and 3–4 below, so leader lines rise or drop vertically and
 * never cross each other or text. Everything is visible without interaction;
 * dots and note titles are buttons with aria-pressed.
 */
export function Details() {
  const [pressed, setPressed] = useState<FeatureKey | null>(null);
  const [hovered, setHovered] = useState<FeatureKey | null>(null);
  const shown = hovered ?? pressed;
  const toggle = (k: FeatureKey) => setPressed((cur) => (cur === k ? null : k));

  const dots = (vertical: boolean) =>
    anatomy.map((f, i) => {
      const p = (vertical ? images.hotspotsVertical : images.hotspots)[f.key];
      return (
        <button
          key={f.key}
          type="button"
          className={styles.dot}
          data-key={f.key}
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
    });

  return (
    <section id="details" className={styles.section} aria-labelledby="details-title">
      <div className={`container ${styles.head}`}>
        <h2 id="details-title">{details.title}</h2>
        <p className={styles.intro}>{details.intro}</p>
      </div>

      <figure className={`container ${styles.anatomy}`} data-shown={shown ?? ''}>
        {/* horizontal on tablet/desktop, vertical on mobile: two boxes so the
            percentage-positioned hotspots always match the visible image */}
        <div className={`${styles.stage} ${styles.stageH}`}>
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
                style={{ left: `${p.x}%`, ['--y' as string]: `${p.y}%` }}
              />
            );
          })}
          {dots(false)}
        </div>
        <div className={`${styles.stage} ${styles.stageV}`}>
          <Picture image={images.vertical} alt={alts.sleeve} sizes="220px" imgClassName={styles.img} />
          {dots(true)}
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

        <p className={styles.useNote}>{details.useNote}</p>
      </figure>

      <div className={`container ${styles.reference}`}>
        <div className={styles.refText}>
          <h3>{details.reference.title}</h3>
          <p>{details.reference.text}</p>
        </div>
        <figure className={styles.refFlat}>
          <Picture
            image={images.refFlatlay}
            alt={alts.refFlatlay}
            sizes="(max-width: 767px) calc(100vw - 40px), 560px"
            imgClassName={styles.refImg}
          />
          <figcaption>{captions.refFlatlay}</figcaption>
        </figure>
        <figure className={styles.refWorn}>
          <Picture image={images.refWorn} alt={alts.refWorn} sizes="112px" imgClassName={styles.refImg} />
          <figcaption>{captions.refWorn}</figcaption>
        </figure>
      </div>
    </section>
  );
}
