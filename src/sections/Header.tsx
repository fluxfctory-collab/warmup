import { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '../components/Logo';
import { ButtonLink } from '../components/ButtonLink';
import { contactCta, navItems } from '../content/navigation';
import styles from './Header.module.css';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) menuButton.current?.focus();
  }, []);

  // open: lock background scroll, move focus into the panel, trap Tab,
  // close on Escape and when the layout grows past the mobile breakpoint
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('is-locked');
    const first = panel.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panel.current || !menuButton.current) return;
      const focusables = [menuButton.current, ...panel.current.querySelectorAll<HTMLElement>('a, button')];
      const i = focusables.indexOf(document.activeElement as HTMLElement);
      const last = focusables.length - 1;
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        focusables[last].focus();
      } else if (!e.shiftKey && i === last) {
        e.preventDefault();
        focusables[0].focus();
      }
    };
    const mq = window.matchMedia('(min-width: 960px)');
    const onMq = () => mq.matches && close(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open, close]);

  return (
    <header className={styles.header} data-scrolled={scrolled ? 'true' : 'false'}>
      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.logoLink} aria-label="WARMUP Vein Enhancer Sleeve, back to top">
          <Logo className={styles.logo} sizes="(max-width: 599px) 176px, 232px" width={232} />
        </a>

        <nav className={styles.desktopNav} aria-label="Main">
          <ul className={styles.links}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href={contactCta.href} size="small">
            {contactCta.label}
          </ButtonLink>
        </nav>

        <button
          ref={menuButton}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => (open ? close() : setOpen(true))}
        >
          <span className={styles.menuLabel}>{open ? 'Close' : 'Menu'}</span>
          <span className={styles.menuIcon} data-open={open ? 'true' : 'false'} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panel}
        className={styles.panel}
        data-open={open ? 'true' : 'false'}
        hidden={!open}
      >
        <nav aria-label="Main (mobile)" className="container">
          <ul className={styles.panelLinks}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.panelLink} onClick={() => close(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href={contactCta.href} className={styles.panelCta} onClick={() => close(false)}>
            {contactCta.label}
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
