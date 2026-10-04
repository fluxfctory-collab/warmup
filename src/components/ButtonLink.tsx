import type { AnchorHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'solid' | 'text';
  size?: 'regular' | 'small';
};

export function ButtonLink({ variant = 'solid', size = 'regular', className, ...rest }: Props) {
  const cls = [
    variant === 'solid' ? styles.button : styles.textLink,
    size === 'small' ? styles.small : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <a className={cls} {...rest} />;
}

export { styles as buttonStyles };
