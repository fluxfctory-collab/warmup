import { Picture } from '../components/Picture';
import { images } from '../content/images';
import { construction } from '../content/product';
import styles from './Construction.module.css';

const cropAlt = {
  fleece: 'Close-up of the cream brushed fleece body of Prototype 2.4 at its lower edge.',
  strap: 'Close-up of the charcoal knit strap with its white hook-and-loop strip, attached at the upper-arm cuff.',
  pouch: 'Close-up of the patch pouch on the fleece body and its charcoal-bound slot opening.',
  mitten:
    'Proposed design visualization of the integrated mitten: the charcoal knit wrist section continuing into a rounded mitten with a separate thumb.',
} as const;

export function Construction() {
  return (
    <section className={styles.section} aria-labelledby="construction-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.side}>
          <h2 id="construction-title">{construction.title}</h2>
          <p className={styles.intro}>{construction.intro}</p>
        </div>
        <ul className={styles.rows}>
          {construction.rows.map((row) => (
            <li key={row.key} className={styles.row} data-key={row.key}>
              <Picture
                image={images.crop[row.key]}
                alt={cropAlt[row.key]}
                sizes="(max-width: 599px) 112px, 176px"
                className={styles.thumb}
                imgClassName={styles.thumbImg}
              />
              <div className={styles.rowText}>
                <h3 className={styles.rowTitle}>{row.title}</h3>
                <p>{row.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
