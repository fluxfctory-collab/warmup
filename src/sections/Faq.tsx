import { Accordion } from '../components/Accordion';
import { faqs } from '../content/faq';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section id="faqs" className={styles.section} aria-labelledby="faq-title">
      <div className={`container ${styles.grid}`}>
        <h2 id="faq-title" className={styles.title}>
          Questions, answered plainly.
        </h2>
        <div className={styles.list}>
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
