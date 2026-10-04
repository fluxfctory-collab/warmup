import { ButtonLink } from '../components/ButtonLink';
import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, captions, hero } from '../content/product';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.copyGrid}`}>
        <h1 id="hero-title" className={styles.title}>
          {hero.title}
        </h1>
        <div className={styles.copy}>
          <p className={styles.descriptor}>{hero.descriptor}</p>
          <p className={styles.lead}>{hero.lead}</p>
          <div className={styles.actions}>
            <ButtonLink href={hero.primary.href}>{hero.primary.label}</ButtonLink>
            <ButtonLink href={hero.secondary.href} variant="text">
              {hero.secondary.label}
            </ButtonLink>
          </div>
        </div>
      </div>

      <figure className={styles.figure} aria-labelledby="hero-caption">
        <div className={styles.stage}>
          <Picture
            image={images.flatlay}
            alt={alts.sleeve}
            sizes="(max-width: 599px) min(76vw, 300px), (max-width: 1279px) calc(100vw - 64px), 1240px"
            priority
            art={[
              {
                media: '(max-width: 599px)',
                image: images.vertical,
                sizes: 'min(76vw, 300px)',
              },
            ]}
            className={styles.picture}
            imgClassName={styles.img}
          />
        </div>
        <figcaption id="hero-caption" className={styles.caption}>
          <span className={styles.tick} aria-hidden="true" />
          {captions.proposed}
        </figcaption>
      </figure>

      <div className="container">
        <ul className={styles.facts} aria-label="At a glance">
          {hero.facts.map((f, i) => (
            <li key={f} data-warm={i === hero.facts.length - 1 ? 'true' : undefined}>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
