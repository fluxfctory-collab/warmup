import { clinical } from '../content/product';
import styles from './Clinical.module.css';

/** Compact clinical context: two differentiated columns plus the reuse note. */
export function Clinical() {
  return (
    <section className={styles.section} aria-labelledby="clinical-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <h2 id="clinical-title">{clinical.title}</h2>
          <p className={styles.scope}>{clinical.scope}</p>
        </div>
        <div className={styles.row}>
          {clinical.blocks.map((b, i) => (
            <div
              key={b.title}
              className={styles.block}
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}
            >
              <p className={styles.label}>
                <span className={styles.index} aria-hidden="true">
                  {i === 0 ? 'A' : 'B'}
                </span>
                {b.label}
              </p>
              <h3>{b.title}</h3>
              <p className={styles.text}>{b.text}</p>
            </div>
          ))}
          <div className={styles.retention} data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            <p className={styles.retentionLabel}>Same-patient reuse</p>
            <p className={styles.retentionText}>{clinical.retention}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
