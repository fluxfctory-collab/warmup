import { clinical } from '../content/product';
import styles from './Clinical.module.css';

export function Clinical() {
  return (
    <section className={styles.section} aria-labelledby="clinical-title">
      <div className={`container ${styles.grid}`}>
        <h2 id="clinical-title" className={styles.title}>
          {clinical.title}
        </h2>
        <div className={styles.blocks}>
          {clinical.blocks.map((b) => (
            <div key={b.title} className={styles.block}>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.foot}>
          <p className={styles.retention}>{clinical.retention}</p>
          <p className={styles.scope}>{clinical.scope}</p>
        </div>
      </div>
    </section>
  );
}
