import { useRef } from 'react';
import { ButtonLink } from '../components/ButtonLink';
import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, captions, hero } from '../content/product';
import { useHeroIntro } from '../motion/useHeroIntro';
import styles from './Hero.module.css';

/**
 * Hero: descriptor and headline, supporting copy and actions, then the
 * complete sleeve on a softly lit product plate. A thin scale under the
 * sleeve marks what it covers, upper arm to hand (vertical on phones, beside
 * the art-directed vertical view). The plate's tag says what the image is.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  useHeroIntro(root);

  return (
    <section id="top" ref={root} className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.top}`}>
        <div className={styles.intro}>
          <p className={styles.kicker} data-intro="kicker">
            {hero.descriptor}
          </p>
          <h1 id="hero-title" className={styles.title} data-intro="title">
            {hero.title}
          </h1>
        </div>
        <div className={styles.copy}>
          <p className={styles.lead} data-intro="lead">
            {hero.lead}
          </p>
          <div className={styles.actions} data-intro="actions">
            <ButtonLink href={hero.primary.href}>{hero.primary.label}</ButtonLink>
            <ButtonLink href={hero.secondary.href} variant="text">
              {hero.secondary.label}
            </ButtonLink>
          </div>
        </div>
      </div>

      <figure className={styles.plate} data-intro="plate" aria-labelledby="hero-caption">
        <figcaption id="hero-caption" className={styles.caption} data-intro-label>
          {captions.proposed}
        </figcaption>
        <div className={styles.stage}>
          <div className={styles.product} data-intro-product>
            <Picture
              image={images.flatlay}
              alt={alts.sleeve}
              sizes="(max-width: 599px) 210px, (max-width: 1279px) calc(100vw - 80px), 1224px"
              priority
              art={[{ media: '(max-width: 599px)', image: images.vertical, sizes: '210px' }]}
              imgClassName={styles.img}
            />
          </div>
          <div className={styles.scale} aria-hidden="true">
            <span className={styles.scaleLine} data-intro-line />
            <span className={styles.scaleLabel} data-end="arm" data-intro-label>
              {hero.scale.arm}
            </span>
            <span className={styles.scaleLabel} data-end="hand" data-intro-label>
              {hero.scale.hand}
            </span>
          </div>
        </div>
      </figure>
    </section>
  );
}
