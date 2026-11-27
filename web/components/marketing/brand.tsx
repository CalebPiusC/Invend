import { BrandIcon } from '../brand-icon';
import styles from './homepage.module.css';

export function Brand({
  inverse = false,
  wordmark = 'invend',
  className = '',
}: {
  inverse?: boolean;
  wordmark?: 'invend' | 'Invend';
  className?: string;
}) {
  return (
    <span className={`${styles.brand} ${inverse ? styles.brandInverse : ''} ${className}`}>
      <span className={styles.brandMark} aria-hidden="true">
        <BrandIcon size={30} />
      </span>
      <span>{wordmark}</span>
    </span>
  );
}
