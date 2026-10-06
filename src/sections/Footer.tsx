import { Logo } from '../components/Logo';
import { contactCta, navItems } from '../content/navigation';
import { footer } from '../content/product';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo className={styles.logo} sizes="200px" width={200} />
          <p className={styles.line}>{footer.line}</p>
        </div>
        <nav aria-labelledby="footer-nav-title" className={styles.nav}>
          <p id="footer-nav-title" className={`label ${styles.colTitle}`}>
            On this page
          </p>
          <ul>
            {[...navItems, contactCta].map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label === 'Contact us' ? 'Contact' : n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.about}>
          <p className={`label ${styles.colTitle}`}>About this site</p>
          <ul>
            {footer.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div className={styles.bar}>
          <p>
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> WARMUP
          </p>
          <a href="#top" className={styles.top}>
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
