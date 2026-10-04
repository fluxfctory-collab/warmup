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
        <nav aria-label="Footer" className={styles.nav}>
          <ul>
            {[...navItems, contactCta].map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label === 'Contact us' ? 'Contact' : n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.copy}>
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> WARMUP
        </p>
      </div>
    </footer>
  );
}
