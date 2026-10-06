import { Accordion } from '../components/Accordion';
import { faqs } from '../content/faq';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section id="faqs" className={styles.section} aria-labelledby="faq-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head} data-reveal>
          <h2 id="faq-title" className={styles.title}>
            Questions, answered plainly.
          </h2>
          <p className={styles.sub}>Short answers about what the sleeve is and how it is meant to be used.</p>
          <p className={styles.more}>
            Something else? <a href="#contact">Send a professional enquiry</a>
          </p>
        </div>
        <div className={styles.list} data-reveal>
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
