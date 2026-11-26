import { BrandIcon } from '../brand-icon';
import styles from './homepage.module.css';

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`${styles.brand} ${inverse ? styles.brandInverse : ''}`}>
      <span className={styles.brandMark} aria-hidden="true">
        <BrandIcon size={30} />
      </span>
      <span>invend</span>
    </span>
  );
}
