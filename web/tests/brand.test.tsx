import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandIcon } from '../components/brand-icon';
import { Brand } from '../components/marketing/brand';
import { INVEND_CHAT_CART_PATH, INVEND_EMERALD } from '../lib/brand-mark';

describe('Invend identity', () => {
  it('uses one message-first silhouette with cart details contained in its negative space', () => {
    const { container } = render(<BrandIcon size={32} className="test-icon" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveClass('test-icon');
    const paths = svg.querySelectorAll('path');
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute('d', INVEND_CHAT_CART_PATH);
    expect(paths[0]).toHaveAttribute('fill-rule', 'evenodd');
    expect(paths[0]).toHaveAttribute('fill', 'currentColor');
    expect(svg.querySelectorAll('circle')).toHaveLength(0);
    expect(INVEND_EMERALD).toBe('#16845B');
  });

  it.each([false, true])(
    'preserves existing wordmarks outside navigation (inverse=%s)',
    (inverse) => {
      const { container } = render(
        <a href="/" aria-label="Invend home">
          <Brand inverse={inverse} />
        </a>,
      );
      expect(screen.getByRole('link', { name: 'Invend home' })).toHaveTextContent(/^invend$/);
      expect(container.querySelectorAll('svg[data-brand="invend"]')).toHaveLength(1);
      expect(container.textContent).not.toMatch(/selvora|invend\./i);
    },
  );

  it('supports the requested capitalised navigation wordmark without changing the default', () => {
    const { container } = render(<Brand wordmark="Invend" className="navigation-brand" />);
    expect(container.textContent).toBe('Invend');
    expect(container.firstElementChild).toHaveClass('navigation-brand');
  });
});
