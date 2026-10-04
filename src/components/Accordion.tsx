import { useState } from 'react';
import styles from './Accordion.module.css';

export type AccordionItem = { id: string; question: string; answer: string[] };

/**
 * Accessible accordion: real <button>s with aria-expanded / aria-controls,
 * answers always in the DOM. Without JavaScript (the page is prerendered) the
 * `html.js` class is absent and every answer stays visible for reading.
 */
export function Accordion({ items, headingLevel = 3 }: { items: AccordionItem[]; headingLevel?: 3 | 4 }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const Heading = headingLevel === 3 ? 'h3' : 'h4';

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const btnId = `faq-q-${item.id}`;
        const panelId = `faq-a-${item.id}`;
        return (
          <div className={styles.item} key={item.id} data-open={isOpen ? 'true' : 'false'}>
            <Heading className={styles.heading}>
              <button
                type="button"
                id={btnId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span className={styles.question}>{item.question}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={btnId} className={styles.panel}>
              <div className={styles.panelInner}>
                {item.answer.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
