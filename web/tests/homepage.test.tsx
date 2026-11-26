import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../components/marketing/homepage';
import AppPage from '../app/app/page';
import { DataProvider } from '../components/data/provider';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('public homepage', () => {
  it('introduces the product without mounting a tenant workspace or requesting business data', () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'More conversations.Less back-and-forth.',
    );
    expect(screen.getByAltText(/Nigerian roadside shop/)).toBeInTheDocument();
    expect(screen.queryByTestId('sample-label')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: /^Get started/ })
        .every((link) => link.getAttribute('href') === '/app?auth=sign-up'),
    ).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('opens and closes the mobile disclosure with Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const nav = screen.getByRole('navigation', { name: 'Mobile site navigation' });
    expect(within(nav).getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/app?auth=sign-in',
    );
    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    expect(
      screen.queryByRole('navigation', { name: 'Mobile site navigation' }),
    ).not.toBeInTheDocument();
  });

  it('supports arrow and Home/End keyboard navigation through labelled demonstration panels', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    await user.keyboard('{ArrowDown}');
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/All the context/);
    await user.keyboard('{End}');
    expect(tabs[3]).toHaveFocus();
    expect(screen.getByText('Payment not confirmed')).toBeInTheDocument();
    await user.keyboard('{Home}');
    expect(tabs[0]).toHaveFocus();
    expect(screen.getByText(/Live photo extraction is still in development/)).toBeInTheDocument();
  });

  it('makes approval interactive but never sends messages or claims payment verification', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    await user.click(screen.getByRole('tab', { name: /important decisions/ }));
    await user.click(screen.getByRole('button', { name: 'Try approving this reply' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'No message was sent and no order was changed.',
    );
    expect(screen.getByRole('button', { name: 'Approved in this demo' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    expect(screen.getByRole('button', { name: 'Try approving this reply' })).toBeEnabled();
    await user.click(screen.getByRole('tab', { name: /From “I want it”/ }));
    expect(screen.getByText('Payment not confirmed')).toBeInTheDocument();
    expect(
      screen.getByText(/A screenshot or a payment claim is not verification/),
    ).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('workspace route continuity', () => {
  it('keeps an honestly labelled sample workspace available separately', async () => {
    vi.stubEnv('DATA_MODE', 'mock');
    const page = await AppPage({ searchParams: Promise.resolve({}) });
    expect(page.type).toBe(DataProvider);
    expect(page.props.mode).toBe('mock');
  });

  it.each(['sign-in', 'sign-up'])(
    'never treats the %s account CTA as a fictional login',
    async (auth) => {
      vi.stubEnv('DATA_MODE', 'mock');
      const page = await AppPage({ searchParams: Promise.resolve({ auth }) });
      expect(page.props.mode).toBe('api');
    },
  );
});
