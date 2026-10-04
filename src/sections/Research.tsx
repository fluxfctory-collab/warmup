import { references, researchIntro, researchScope } from '../content/research';
import styles from './Research.module.css';

/**
 * Compact editorial reference list. Each entry shows year, a short accurate
 * label, first author and journal, one sentence on design and population, and
 * one primary source link. Full title, authors, citation, summary and every
 * link stay one click away in a native <details> disclosure.
 */
export function Research() {
  return (
    <section id="research" className={styles.section} aria-labelledby="research-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head} data-reveal>
          <h2 id="research-title">Research on warming before venous access.</h2>
          <p className={styles.intro}>{researchIntro}</p>
          <p className={styles.scope}>{researchScope}</p>
        </div>

        <ol className={styles.list}>
          {references.map((r) => {
            const primary = r.links[0];
            return (
              <li key={r.id} className={styles.entry} data-reveal>
                <p className={styles.year}>{r.year}</p>
                <div className={styles.body}>
                  <h3 className={styles.title}>{r.short}</h3>
                  <p className={styles.meta}>
                    {r.lead} <span className={styles.journal}>{r.journalShort}</span>
                  </p>
                  <p className={styles.brief}>{r.brief}</p>
                  <details className={styles.more}>
                    <summary>Full citation and details</summary>
                    <div className={styles.moreBody}>
                      <p className={styles.fullTitle}>{r.title}</p>
                      <p className={styles.citation}>
                        {r.authors} <em>{r.journal}</em>
                      </p>
                      <p>{r.summary}</p>
                      <ul className={styles.links} aria-label={`Sources for ${r.lead} ${r.year}`}>
                        {r.links.map((l) => (
                          <li key={l.href}>
                            <a href={l.href} rel="noopener">
                              {l.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
                <a className={styles.source} href={primary.href} rel="noopener">
                  Source<span className="visually-hidden">: {r.short} ({r.year}), DOI</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
