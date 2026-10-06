import { references, researchIntro, researchScope } from '../content/research';
import styles from './Research.module.css';

/**
 * Research index. A scope box beside the heading keeps general warming
 * research visibly apart from the product. Each study is one scannable row:
 * year, short accurate label with first author and journal, design,
 * population and one primary source link. Full title, authors, citation,
 * summary and every link stay one click away in a native <details>.
 */
export function Research() {
  return (
    <section id="research" className={styles.section} aria-labelledby="research-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <div className={styles.headText}>
            <h2 id="research-title">Research on warming before venous access.</h2>
            <p className={styles.intro}>{researchIntro}</p>
          </div>
          <div className={styles.scope}>
            <p className={styles.scopeLabel}>{researchScope.label}</p>
            <p className={styles.scopeText}>{researchScope.text}</p>
          </div>
        </div>

        <div className={styles.index}>
          <div className={styles.columns} aria-hidden="true">
            <span>Year</span>
            <span>Study</span>
            <span>Design</span>
            <span>Population</span>
            <span />
          </div>
          <ol className={styles.list}>
            {references.map((r) => {
              const primary = r.links[0];
              return (
                <li key={r.id} className={styles.entry} data-reveal>
                  <p className={styles.year}>{r.year}</p>
                  <div className={styles.study}>
                    <h3 className={styles.title}>{r.short}</h3>
                    <p className={styles.meta}>
                      {r.lead} <span className={styles.journal}>{r.journalShort}</span>
                    </p>
                    <details className={styles.more}>
                      <summary>Full citation and summary</summary>
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
                  <dl className={styles.facts}>
                    <div>
                      <dt>Design</dt>
                      <dd>{r.design}</dd>
                    </div>
                    <div>
                      <dt>Population</dt>
                      <dd>{r.population}</dd>
                    </div>
                  </dl>
                  <a className={styles.source} href={primary.href} rel="noopener">
                    Source<span className="visually-hidden">: {r.short} ({r.year}), DOI</span>
                    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
