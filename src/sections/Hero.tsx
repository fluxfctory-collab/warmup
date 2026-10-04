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
        <div className={styles.product}>
          <Picture
            image={images.flatlay}
            alt={alts.sleeve}
            sizes="(max-width: 1279px) calc(100vw - 40px), calc(50vw + 600px)"
            priority
            art={[
              {
                media: '(max-width: 599px)',
                image: images.vertical,
                sizes: 'min(80vw, 320px)',
              },
            ]}
            imgClassName={styles.img}
          />
        </div>
        <div className={`container ${styles.below}`}>
          <p className={styles.body}>{hero.body}</p>
          <figcaption id="hero-caption" className={styles.caption}>
            <span className={styles.tick} aria-hidden="true" />
            {captions.proposed}
          </figcaption>
        </div>
      </figure>

      <div className="container">
        <ul className={styles.facts} aria-label="At a glance">
          {hero.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
