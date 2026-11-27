import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Homepage } from '../components/marketing/homepage';
import { navigationFeatures, featureDestination } from '../components/marketing/feature-navigation';

const tourNames = [
  'Smart Customer Inbox',
  'AI-Assisted Customer Conversations',
  'Photo-First Catalogue',
  'Order Management',
  'Payment Tracking',
  'Digital Receipts',
  'Business Insights',
  'Team Management',
];
const observers: {
  callback: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];
const mediaListeners = new Map<string, Set<() => void>>();
beforeEach(() => {
  window.history.replaceState(null, '', '/');
  observers.length = 0;
  mediaListeners.clear();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: IntersectionObserverCallback) {
        observers.push(this);
      }
    },
  );
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: query === '(hover: hover)' || query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: (_: string, fn: () => void) => {
          if (!mediaListeners.has(query)) mediaListeners.set(query, new Set());
          mediaListeners.get(query)!.add(fn);
        },
        removeEventListener: (_: string, fn: () => void) => mediaListeners.get(query)?.delete(fn),
        addListener() {},
        removeListener() {},
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  );
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.open = false;
    },
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
  window.history.replaceState(null, '', '/');
});
const trigger = () => screen.getByRole('button', { name: 'Features' });
const menu = () => screen.getByRole('region', { name: 'Explore Invend features' });

describe('focused premium navigation', () => {
  it('has five central controls, separate real account links and a capitalised navigation wordmark', () => {
    render(<Homepage />);
    const main = screen.getByRole('navigation', { name: 'Main navigation' });
    expect([...main.children].map((element) => element.textContent?.trim())).toEqual([
      'Home',
      'Features',
      'How it works',
      'Pricing',
      'About',
    ]);
    const account = within(screen.getByRole('navigation', { name: 'Account navigation' }));
    expect(account.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/app?auth=sign-in',
    );
    expect(account.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/app?auth=sign-up',
    );
    expect(
      within(screen.getByRole('banner')).getByRole('link', { name: 'Invend home' }),
    ).toHaveTextContent(/^Invend$/);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('region', { name: 'Explore Invend features' }),
    ).not.toBeInTheDocument();
  });

  it('opens on click, uses grouped navigation rather than a menubar, and toggles closed', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    for (const name of ['Conversations', 'Commerce', 'Operations', 'Business'])
      expect(within(menu()).getByRole('heading', { name })).toBeInTheDocument();
    expect(menu().querySelectorAll('[data-feature-link]')).toHaveLength(8);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens from the keyboard, updates previews on focus and supports directional navigation', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    const links = [...menu().querySelectorAll<HTMLAnchorElement>('[data-feature-link]')];
    await waitFor(() => expect(links[0]).toHaveFocus());
    expect(menu().querySelector('[data-preview-feature]')).toHaveAttribute(
      'data-preview-feature',
      'inbox',
    );
    await user.keyboard('{ArrowRight}');
    expect(links[2]).toHaveFocus();
    expect(menu().querySelector('[data-preview-feature]')).toHaveAttribute(
      'data-preview-feature',
      'catalogue',
    );
    expect(
      within(menu()).getByText(/extraction and durable photo storage are not live/),
    ).toBeInTheDocument();
    await user.keyboard('{End}');
    expect(links[7]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(links[0]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(links[7]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(links[0]).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens at the last feature with ArrowUp and enters the menu with Tab from its trigger', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    trigger().focus();
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(menu().querySelector('[data-feature-link="team"]')).toHaveFocus());
    await user.keyboard('{Escape}');
    await user.click(trigger());
    trigger().focus();
    await user.keyboard('{Tab}');
    await waitFor(() => expect(menu().querySelector('[data-feature-link="inbox"]')).toHaveFocus());
  });

  it('keeps Tab traversal in the visual navigation order without trapping desktop focus', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    trigger().focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(menu().querySelector('[data-feature-link="inbox"]')).toHaveFocus());
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard(' ');
    await waitFor(() => expect(menu().querySelector('[data-feature-link="inbox"]')).toHaveFocus());
    for (let index = 0; index < 10; index++) await user.keyboard('{Tab}');
    expect(
      within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('link', {
        name: 'How it works',
      }),
    ).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('restores trigger focus when an outside non-control dismisses a focused menu', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    trigger().focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(menu().querySelector('[data-feature-link="inbox"]')).toHaveFocus());
    fireEvent.pointerDown(screen.getByRole('heading', { level: 1 }));
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('updates every read-only preview by pointer without fetching business data', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    render(<Homepage />);
    await user.hover(trigger());
    for (const feature of navigationFeatures) {
      const link = menu().querySelector<HTMLAnchorElement>(`[data-feature-link="${feature.key}"]`)!;
      await user.hover(link);
      expect(menu().querySelector('[data-preview-feature]')).toHaveAttribute(
        'data-preview-feature',
        feature.key,
      );
      expect(link).toHaveAttribute('href', featureDestination(feature));
      expect(within(menu()).getByText(feature.readiness)).toBeInTheDocument();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('allows travel across the hover gap and dismisses an unpinned menu after leaving', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await user.hover(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await user.unhover(trigger());
    await user.hover(menu());
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await user.unhover(menu());
    await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'false'));
  });

  it('keeps a click-open menu pinned through pointer movement and closes on outside interaction', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await user.click(trigger());
    await user.unhover(trigger());
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('heading', { level: 1 }));
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('dismisses when keyboard focus moves outside the header', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    trigger().focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(menu().querySelector('[data-feature-link="inbox"]')).toHaveFocus());
    act(() => screen.getByRole('link', { name: 'See how it works' }).focus());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it.each(navigationFeatures)(
    'selects and focuses the existing $key panel on a direct deep link',
    async (feature) => {
      window.history.replaceState(null, '', `/${featureDestination(feature)}`);
      render(<Homepage />);
      const panel = screen.getByRole('tabpanel', { name: tourNames[feature.index] });
      expect(panel).toHaveAttribute('id', `feature-panel-${feature.index}`);
      await waitFor(() => expect(panel).toHaveFocus());
      expect(vi.mocked(panel.scrollIntoView).mock.contexts).toContain(panel);
    },
  );

  it('reselects the same hash after a manual tour change and closes the disclosure', async () => {
    window.history.replaceState(null, '', '/#feature-panel-2');
    const user = userEvent.setup();
    render(<Homepage />);
    await user.click(screen.getByRole('tab', { name: 'Team Management' }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Team Management');
    await user.click(trigger());
    await user.click(within(menu()).getByRole('link', { name: /^Product catalogue/ }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Photo-First Catalogue');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.getByRole('tabpanel')).toHaveFocus());
  });

  it('uses a simple expandable mobile feature section and keeps auth actions unchanged', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    document.body.style.overflow = 'clip';
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = screen.getByRole('dialog', { name: 'Site navigation' });
    const mobile = within(dialog);
    expect(mobile.getByRole('link', { name: 'Home' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog.querySelector('details')).not.toHaveAttribute('open');
    await user.click(mobile.getByText('Features', { exact: true }));
    expect(dialog.querySelector('details')).toHaveAttribute('open');
    for (const feature of navigationFeatures)
      expect(mobile.getByRole('link', { name: new RegExp(`^${feature.name}`) })).toHaveAttribute(
        'href',
        featureDestination(feature),
      );
    expect(mobile.queryByRole('complementary')).not.toBeInTheDocument();
    expect(mobile.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/app?auth=sign-in',
    );
    expect(mobile.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/app?auth=sign-up',
    );
    mobile.getByRole('link', { name: 'Get started' }).focus();
    await user.keyboard('{Tab}');
    expect(mobile.getByRole('button', { name: 'Close navigation' })).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(mobile.getByRole('link', { name: 'Get started' })).toHaveFocus();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(document.body.style.overflow).toBe('clip');
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveFocus();
  });

  it('derives the compact state from a document sentinel and cleans up observers/listeners', async () => {
    const user = userEvent.setup();
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<Homepage />);
    expect(observers).toHaveLength(3); // Sentinel, section tracking, and integration animation visibility.
    expect(observers[0].observe).toHaveBeenCalledTimes(1);
    expect(observers[1].observe).toHaveBeenCalledTimes(10);
    expect(observers[2].observe).toHaveBeenCalledWith(screen.getByTestId('integration-map'));
    act(() =>
      observers[0].callback(
        [
          { isIntersecting: false, boundingClientRect: { top: -30 } },
        ] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    expect(screen.getByRole('banner')).toHaveAttribute('data-solid', 'true');
    act(() =>
      observers[0].callback(
        [{ isIntersecting: true, boundingClientRect: { top: 0 } }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    expect(screen.getByRole('banner')).toHaveAttribute('data-solid', 'false');
    await user.click(trigger());
    unmount();
    observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalled());
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(document.documentElement.dataset.marketing).toBeUndefined();
    expect(mediaListeners.get('(min-width: 1100px)')?.size).toBe(0);
  });
});
