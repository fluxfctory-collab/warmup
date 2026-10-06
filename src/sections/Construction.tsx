import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { alts, captions, construction } from '../content/product';
import styles from './Construction.module.css';

/**
 * The page's one deep navy chapter: four close-ups in a staggered editorial
 * grid, numbered like the anatomy so each detail can be found on the sleeve.
 * Every picture carries a tag saying whether it is a Prototype 2.4
 * photograph or part of the proposed design visualization.
 */
export function Construction() {
  return (
    <section className={styles.section} aria-labelledby="construction-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.head} data-reveal>
          <h2 id="construction-title">{construction.title}</h2>
          <p className={styles.intro}>{construction.intro}</p>
          <ul className={styles.legend} aria-label="Image labels">
            <li>
              <span className="tag" data-kind="photo">
                {captions.photo}
              </span>
              {construction.legend.photo}
            </li>
            <li>
              <span className="tag" data-kind="visualization">
                {captions.visualization}
              </span>
              {construction.legend.visualization}
            </li>
          </ul>
        </div>

        <ol className={styles.items}>
          {construction.rows.map((row, i) => {
            const isVisual = row.key === 'mitten';
            return (
              <li key={row.key} className={styles.item} data-key={row.key} data-reveal>
                <figure className={styles.frame}>
                  <Picture
                    image={images.crop[row.key]}
                    alt={alts[row.key]}
                    sizes="(max-width: 599px) 112px, (max-width: 1023px) 44vw, 340px"
                    imgClassName={styles.img}
                  />
                  <figcaption className={`tag ${styles.tag}`} data-kind={isVisual ? 'visualization' : 'photo'}>
                    {isVisual ? captions.visualization : captions.photo}
                  </figcaption>
                </figure>
                <div className={styles.body}>
                  <h3 className={styles.title}>
                    <span className={styles.num} aria-hidden="true">
                      {i + 1}
                    </span>
                    {row.title}
                  </h3>
                  <p className={styles.text}>{row.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
