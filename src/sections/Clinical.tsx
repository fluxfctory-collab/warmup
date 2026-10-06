import { clinical } from '../content/product';
import styles from './Clinical.module.css';

/** Clinical context: two moments of use split by a hairline, then the
 * same-patient reuse note as its own band. Not cards, not a protocol. */
export function Clinical() {
  return (
    <section className={styles.section} aria-labelledby="clinical-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <h2 id="clinical-title">{clinical.title}</h2>
          <p className={styles.scope}>{clinical.scope}</p>
        </div>
        <div className={styles.moments}>
          {clinical.blocks.map((b, i) => (
            <div key={b.title} className={styles.moment} data-reveal>
              <p className={styles.label}>
                <span className={styles.index} aria-hidden="true">
                  {i === 0 ? 'A' : 'B'}
                </span>
                {b.label}
              </p>
              <h3 className={styles.title}>{b.title}</h3>
              <p className={styles.text}>{b.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.reuse} data-reveal>
          <p className={styles.reuseLabel}>Same-patient reuse</p>
          <p className={styles.reuseText}>{clinical.retention}</p>
        </div>
      </div>
    </section>
  );
}
