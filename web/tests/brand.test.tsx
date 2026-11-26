import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandIcon } from '../components/brand-icon';
import { Brand } from '../components/marketing/brand';
import { INVEND_BAG_PATH, INVEND_GOLD, INVEND_HANDLE_PATH } from '../lib/brand-mark';

describe('Invend identity', () => {
  it('uses the shared bag/filter silhouette, open handle and restrained gold accent', () => {
    const { container } = render(<BrandIcon size={32} className="test-icon" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveClass('test-icon');
    const [handle, bag] = svg.querySelectorAll('path');
    expect(handle).toHaveAttribute('d', INVEND_HANDLE_PATH);
    expect(bag).toHaveAttribute('d', INVEND_BAG_PATH);
    expect(bag).toHaveAttribute('fill-rule', 'evenodd');
    expect(svg.querySelector('circle')).toHaveAttribute('fill', INVEND_GOLD);
  });

  it.each([false, true])('keeps the exact lowercase wordmark (inverse=%s)', (inverse) => {
    const { container } = render(
      <a href="/" aria-label="Invend home">
        <Brand inverse={inverse} />
      </a>,
    );
    expect(screen.getByRole('link', { name: 'Invend home' })).toHaveTextContent(/^invend$/);
    expect(container.querySelectorAll('svg[data-brand="invend"]')).toHaveLength(1);
    expect(container.textContent).not.toMatch(/selvora|invend\./i);
  });
});
