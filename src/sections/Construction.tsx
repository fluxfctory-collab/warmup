import { FeatureIcon } from '../components/FeatureIcon';
import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, captions, construction } from '../content/product';
import styles from './Construction.module.css';

/** The page's one deep navy chapter: how the sleeve is put together. */
export function Construction() {
  return (
    <section className={styles.section} aria-labelledby="construction-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head} data-reveal>
          <h2 id="construction-title">{construction.title}</h2>
          <p className={styles.intro}>{construction.intro}</p>
        </div>

        <figure className={styles.visual} data-reveal>
          <div className={styles.frame}>
            <Picture
              image={images.fastening}
              alt={alts.fastening}
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 40vw, 486px"
              imgClassName={styles.img}
            />
          </div>
          <figcaption className={styles.caption}>{captions.fastening}</figcaption>
        </figure>

        <ul className={styles.rows}>
          {construction.rows.map((row, i) => (
            <li
              key={row.key}
              className={styles.row}
              data-key={row.key}
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 60}ms` }}
            >
              <span className={styles.icon}>
                <FeatureIcon kind={row.key} />
              </span>
              <div>
                <h3 className={styles.rowTitle}>{row.title}</h3>
                <p className={styles.rowText}>{row.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
