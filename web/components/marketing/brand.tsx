import styles from './homepage.module.css';

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`${styles.brand} ${inverse ? styles.brandInverse : ''}`}>
      <span className={styles.brandMark} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 5H9a4 4 0 0 0 0 8h6a3 3 0 0 1 0 6H6m0 0v-4m0 4 4-3"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        selvora<span className={styles.brandDot}>.</span>
      </span>
    </span>
  );
}
