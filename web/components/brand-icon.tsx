import { INVEND_BAG_PATH, INVEND_GOLD, INVEND_HANDLE_PATH } from '../lib/brand-mark';

/** Decorative when paired with the wordmark; icon-only controls label their container. */
export function BrandIcon({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-brand="invend"
      className={className}
    >
      <path d={INVEND_HANDLE_PATH} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d={INVEND_BAG_PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
      <circle cx="48" cy="23" r="2.8" fill={INVEND_GOLD} />
    </svg>
  );
}
