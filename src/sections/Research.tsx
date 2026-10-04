import { references, researchScope } from '../content/research';
import styles from './Research.module.css';

export function Research() {
  return (
    <section id="research" className={styles.section} aria-labelledby="research-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head}>
          <h2 id="research-title">Research on warming before venous access.</h2>
          <p className={styles.scope}>{researchScope}</p>
        </div>
        <ol className={styles.list}>
          {references.map((r) => (
            <li key={r.id} className={styles.entry}>
              <p className={styles.year}>{r.year}</p>
              <div className={styles.body}>
                <h3 className={styles.title}>{r.title}</h3>
                <p className={styles.meta}>
                  {r.authors}
                  <br />
                  <span className={styles.journal}>{r.journal}</span>
                </p>
                <p className={styles.summary}>{r.summary}</p>
                <ul className={styles.links} aria-label={`Links for ${r.authors.split(',')[0]} ${r.year}`}>
                  {r.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} rel="noopener">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
