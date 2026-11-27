import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeHero } from '../components/marketing/home-hero';
import { HeroInstall } from '../components/marketing/hero-install';
import { IntegrationMap, IntegrationStatus } from '../components/marketing/integration-status';
import { integrationStatuses } from '../components/marketing/integration-data';
import { installInstructions } from '../lib/pwa-install';

const observers: {
  callback: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];
let standalone = false;
let displayChange: (() => void) | undefined;
let register = vi.fn();
const originalWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
const originalStandalone = Object.getOwnPropertyDescriptor(navigator, 'standalone');

beforeEach(() => {
  standalone = false;
  displayChange = undefined;
  observers.length = 0;
  document.body.style.overflow = '';
  register = vi.fn().mockResolvedValue({});
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } });
  Object.defineProperty(navigator, 'standalone', { configurable: true, value: false });
  vi.stubGlobal('isSecureContext', true);
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        get matches() {
          return query.includes('display-mode') && standalone;
        },
        media: query,
        onchange: null,
        addEventListener: (_: string, listener: () => void) => {
          displayChange = listener;
        },
        removeEventListener: vi.fn(),
        addListener() {},
        removeListener() {},
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  );
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
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalWorker) Object.defineProperty(navigator, 'serviceWorker', originalWorker);
  else Reflect.deleteProperty(navigator, 'serviceWorker');
  if (originalStandalone) Object.defineProperty(navigator, 'standalone', originalStandalone);
  else Reflect.deleteProperty(navigator, 'standalone');
  document.body.style.overflow = '';
});

function offerInstall(outcome = 'accepted', nativePrompt = vi.fn().mockResolvedValue(undefined)) {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  Object.assign(event, { prompt: nativePrompt, userChoice: Promise.resolve({ outcome }) });
  act(() => {
    window.dispatchEvent(event);
  });
  return { event, nativePrompt };
}
function node(id: string) {
  return document.querySelector<HTMLButtonElement>(`[data-integration-node="${id}"]`)!;
}
function info() {
  return screen.getByRole('region');
}

describe('integrated hero illustration', () => {
  it('uses exact opening copy, real destinations and an explicitly nonfunctional mobile workspace', () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<HomeHero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Every customer conversation. Every order. One workspace.',
    );
    expect(screen.getByText('YOUR BUSINESS, BETTER CONNECTED')).toBeInTheDocument();
    expect(
      screen.getByText(/Bring your customer conversations, product catalogue and orders together/),
    ).toHaveTextContent(
      'Let AI handle routine enquiries while you stay in control of your business.',
    );
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/app?auth=sign-up',
    );
    expect(screen.getByRole('link', { name: 'See how it works' })).toHaveAttribute(
      'href',
      '#how-it-works',
    );
    const showcase = screen.getByTestId('workspace-preview');
    expect(document.getElementById('home')).toContainElement(showcase);
    expect(showcase).toHaveAttribute('id', 'workspace');
    expect(within(showcase).queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByTestId('hero-dashboard')).toHaveTextContent(
      'Fictional data · no live connections',
    );
    expect(screen.getByTestId('hero-phone')).toHaveAccessibleName(
      /Illustrative mobile Invend web app, not interactive/,
    );
    expect(screen.getByTestId('hero-phone')).toHaveTextContent('PROPOSED REPLY · NOT SENT');
    expect(showcase).toHaveTextContent('No real messages, orders or payments');
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('deliberate PWA installation', () => {
  it('registers only the existing worker and never prompts on arrival', () => {
    render(<HeroInstall />);
    expect(register).toHaveBeenCalledExactlyOnceWith('/sw.js');
    const { event, nativePrompt } = offerInstall();
    expect(event.defaultPrevented).toBe(true);
    expect(nativePrompt).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('uses a native prompt once, reports accepted separately, then hides only on confirmed installation', async () => {
    const user = userEvent.setup();
    render(<HeroInstall />);
    const { nativePrompt } = offerInstall();
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    expect(nativePrompt).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Installation requested');
    expect(screen.getByRole('button', { name: 'Install Invend' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(nativePrompt).toHaveBeenCalledOnce();
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.queryByRole('button', { name: 'Install Invend' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });
  it('does not turn a dismissed prompt into an installed or failed account state', async () => {
    const user = userEvent.setup();
    render(<HeroInstall />);
    offerInstall('dismissed');
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    expect(screen.getByRole('status')).toHaveTextContent('dismissed');
    expect(screen.getByRole('button', { name: 'Install Invend' })).toBeEnabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('offers instructions after a native prompt failure without inventing success', async () => {
    const user = userEvent.setup();
    render(<HeroInstall />);
    offerInstall('dismissed', vi.fn().mockRejectedValue(new Error('not eligible')));
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('could not open the install prompt');
    expect(screen.getByRole('status')).not.toHaveTextContent('was installed');
  });
  it('keeps the control disabled while a native prompt is pending', async () => {
    const user = userEvent.setup();
    render(<HeroInstall />);
    let resolve!: () => void;
    const native = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    offerInstall('dismissed', native);
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    expect(screen.getByRole('button', { name: 'Opening installation prompt' })).toBeDisabled();
    await act(async () => {
      resolve();
    });
    expect(screen.getByRole('button', { name: 'Install Invend' })).toBeEnabled();
  });
  it('hides in standalone mode and responds to display-mode changes', () => {
    standalone = true;
    render(<HeroInstall />);
    expect(screen.queryByRole('button', { name: 'Install Invend' })).not.toBeInTheDocument();
    standalone = false;
    act(() => {
      displayChange?.();
    });
    expect(screen.getByRole('button', { name: 'Install Invend' })).toBeVisible();
    standalone = true;
    act(() => {
      displayChange?.();
    });
    expect(screen.queryByRole('button', { name: 'Install Invend' })).not.toBeInTheDocument();
  });
  it('hides for iOS standalone, independent of Chromium prompt support', () => {
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: true });
    render(<HeroInstall />);
    expect(screen.queryByRole('button', { name: 'Install Invend' })).not.toBeInTheDocument();
  });
  it('uses platform guidance with close/Escape/focus restoration and no native-app or offline-data claim', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile Safari/604.1',
    );
    const user = userEvent.setup();
    render(<HeroInstall />);
    const install = screen.getByRole('button', { name: 'Install Invend' });
    document.body.style.overflow = 'clip';
    await user.click(install);
    const dialog = screen.getByRole('dialog', { name: 'Add Invend to your home screen' });
    expect(dialog).toHaveTextContent('Share menu');
    expect(dialog).toHaveTextContent('not a native Android or iOS app');
    expect(dialog).toHaveTextContent('Customer data is not cached');
    expect(
      within(dialog).getByRole('button', { name: 'Close installation instructions' }),
    ).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    within(dialog).getByRole('button', { name: 'Got it' }).focus();
    await user.keyboard('{Tab}');
    expect(
      within(dialog).getByRole('button', { name: 'Close installation instructions' }),
    ).toHaveFocus();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(install).toHaveFocus();
    expect(document.body.style.overflow).toBe('clip');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(install);
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(install).toHaveFocus();
  });
  it('survives service-worker registration failure and never registers in an insecure context', async () => {
    register.mockRejectedValue(new Error('worker blocked'));
    const user = userEvent.setup();
    const first = render(<HeroInstall />);
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    first.unmount();
    register.mockClear();
    vi.stubGlobal('isSecureContext', false);
    render(<HeroInstall />);
    expect(register).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Install Invend' })).toBeEnabled();
  });
  it('cleans up prompt/display listeners and modal scroll lock on unmount', async () => {
    const user = userEvent.setup();
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<HeroInstall />);
    await user.click(screen.getByRole('button', { name: 'Install Invend' }));
    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(remove).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('appinstalled', expect.any(Function));
    const event = new Event('beforeinstallprompt', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe('platform-aware instructions', () => {
  it.each([
    ['iPhone Mobile Safari/604', 0, 'iPhone or iPad'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/18 Safari/605', 5, 'iPhone or iPad'],
    ['Android Chrome/130 Mobile', 0, 'Android'],
    ['Macintosh Version/18 Safari/605', 0, 'Safari on Mac'],
    ['Windows Chrome/130 Safari/537 Edg/130', 0, 'Microsoft Edge'],
    ['Windows Chrome/130 Safari/537', 0, 'Chrome or Chromium'],
    ['Macintosh Chrome/130 Safari/537', 0, 'Chrome or Chromium'],
    ['Windows Firefox/130', 0, 'Your browser'],
  ])('gives appropriate instructions for %s', (agent, touch, platform) => {
    const guidance = installInstructions(agent, touch);
    expect(guidance.platform).toBe(platform);
    expect(guidance.steps).toHaveLength(3);
  });
});

describe('interactive and honest connected-tools diagram', () => {
  it('separates four channels, an Invend companion and two download groups', () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<IntegrationMap />);
    expect(document.querySelectorAll('[data-integration-node]')).toHaveLength(7);
    expect(document.querySelectorAll('[data-group="channel"]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-group="companion"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-group="download"]')).toHaveLength(2);
    expect(node('assistant')).toHaveTextContent('Invend WhatsApp Assistant');
    expect(node('pdf')).toHaveTextContent('Available');
    expect(node('spreadsheets')).toHaveTextContent('Planned');
    expect(screen.getByTestId('integration-map')).not.toHaveTextContent(
      /Paystack|connected successfully|synced|live now/i,
    );
    const images = [...document.querySelectorAll<HTMLImageElement>('[data-integration-node] img')];
    expect(images.map((image) => image.getAttribute('src'))).toEqual(
      integrationStatuses.filter((tool) => tool.logo).map((tool) => tool.logo),
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('reveals one panel on keyboard focus and supports arrow/Home/End navigation', async () => {
    const user = userEvent.setup();
    render(<IntegrationMap />);
    act(() => {
      node('whatsapp').focus();
    });
    expect(info()).toHaveAccessibleName('WhatsApp Business');
    expect(info()).toHaveTextContent('Meta approval');
    await user.keyboard('{ArrowRight}');
    expect(node('gmail')).toHaveFocus();
    expect(info()).toHaveAccessibleName('Gmail');
    expect(screen.getAllByRole('region')).toHaveLength(1);
    await user.keyboard('{End}');
    expect(info()).toHaveAccessibleName('CSV & Excel-compatible exports');
    expect(info()).toHaveTextContent('not implemented');
    await user.keyboard('{Home}');
    expect(node('whatsapp')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(node('spreadsheets')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(node('spreadsheets')).toHaveFocus();
  });
  it('pins, switches, closes and restores focus without automatically reopening', async () => {
    const user = userEvent.setup();
    render(<IntegrationMap />);
    await user.click(node('whatsapp'));
    expect(node('whatsapp')).toHaveAttribute('aria-pressed', 'true');
    expect(info()).toHaveAttribute('data-pinned', 'true');
    await user.click(node('gmail'));
    expect(node('whatsapp')).toHaveAttribute('aria-pressed', 'false');
    expect(info()).toHaveAccessibleName('Gmail');
    await user.click(within(info()).getByRole('button', { name: 'Next tool' }));
    expect(info()).toHaveAccessibleName('Instagram');
    await user.click(within(info()).getByRole('button', { name: 'Previous tool' }));
    expect(info()).toHaveAccessibleName('Gmail');
    await user.click(within(info()).getByRole('button', { name: 'Close tool details' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(node('gmail')).toHaveFocus();
    expect(node('gmail')).toHaveAttribute('aria-expanded', 'false');
  });
  it('dismisses pinned details with Escape, a second activation and an outside pointer', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IntegrationMap />
        <button>Outside</button>
      </>,
    );
    await user.click(node('assistant'));
    within(info()).getByRole('button', { name: 'Close tool details' }).focus();
    await user.keyboard('{Escape}');
    expect(node('assistant')).toHaveFocus();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    await user.click(node('pdf'));
    await user.click(node('pdf'));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    await user.click(node('gmail'));
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });
  it('holds hover details over the panel and dismisses after pointer/focus leave', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IntegrationMap />
        <button>Outside</button>
      </>,
    );
    // userEvent emits real pointerType metadata in jsdom, unlike a plain Event.
    await user.hover(node('gmail'));
    expect(info()).toHaveAccessibleName('Gmail');
    await user.hover(info());
    await new Promise((resolve) => setTimeout(resolve, 220));
    expect(info()).toHaveAccessibleName('Gmail');
    await user.hover(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument());
  });
  it('keeps a pin stable against hover but allows deliberate focus/activation to change it', async () => {
    const user = userEvent.setup();
    render(<IntegrationMap />);
    await user.click(node('whatsapp'));
    await user.hover(node('facebook'));
    expect(info()).toHaveAccessibleName('WhatsApp Business');
    await user.click(node('facebook'));
    expect(info()).toHaveAccessibleName('Facebook');
  });
  it('does not reopen beneath a stationary pointer after close, but accepts a genuine new hover', async () => {
    const user = userEvent.setup();
    render(<IntegrationMap />);
    await user.click(node('instagram'));
    await user.click(within(info()).getByRole('button', { name: 'Close tool details' }));
    const enter = new Event('pointerover', { bubbles: true });
    Object.assign(enter, { pointerType: 'mouse', clientX: 0, clientY: 0 });
    fireEvent(node('assistant'), enter);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    const move = new Event('pointermove', { bubbles: true });
    Object.assign(move, { pointerType: 'mouse', clientX: 140, clientY: 200 });
    fireEvent(node('assistant'), move);
    expect(info()).toHaveAccessibleName('Invend WhatsApp Assistant');
  });
  it('dismisses a pin when keyboard focus leaves the network, without stealing that focus', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IntegrationMap />
        <button>After the diagram</button>
      </>,
    );
    await user.click(node('pdf'));
    act(() => screen.getByRole('button', { name: 'After the diagram' }).focus());
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'After the diagram' })).toHaveFocus();
  });
  it('gates decorative motion on visibility and provides a pause control', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<IntegrationMap />);
    const map = screen.getByTestId('integration-map');
    expect(map).toHaveAttribute('data-motion', 'paused');
    act(() => {
      observers[0].callback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });
    expect(map).toHaveAttribute('data-motion', 'playing');
    expect(screen.getByRole('button', { name: 'Pause diagram animation' })).toHaveTextContent(
      'Pause diagram animation',
    );
    await user.click(screen.getByRole('button', { name: 'Pause diagram animation' }));
    expect(map).toHaveAttribute('data-motion', 'paused');
    expect(screen.getByRole('button', { name: 'Resume diagram animation' })).toHaveTextContent(
      'Resume diagram animation',
    );
    await user.click(screen.getByRole('button', { name: 'Resume diagram animation' }));
    expect(map).toHaveAttribute('data-motion', 'playing');
    await user.click(node('gmail'));
    expect(info()).toHaveAccessibleName('Gmail');
    act(() => {
      observers[0].callback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });
    expect(map).toHaveAttribute('data-motion', 'paused');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalled();
  });
  it('retains explicit launch order, export boundaries and research-only channels in readiness', () => {
    render(<IntegrationStatus />);
    const rows = screen.getAllByRole('listitem', { hidden: true });
    expect(rows).toHaveLength(7);
    expect(rows[0]).toHaveTextContent('Second major channel');
    expect(rows[1]).toHaveTextContent('First planned live channel');
    expect(rows[4]).toHaveTextContent('explicit YES confirmation');
    expect(rows[5]).toHaveTextContent('not a third-party connection');
    expect(rows[6]).toHaveTextContent(
      'Direct Google Sheets or Google Docs integration is not available',
    );
    expect(screen.getByTestId('integration-status')).toHaveTextContent(
      'TikTok messaging remains research-only',
    );
    expect(screen.getByTestId('integration-status')).toHaveTextContent(
      'SMS is exploratory and unsupported',
    );
    expect(new Set(integrationStatuses.map((tool) => tool.status))).toEqual(
      new Set(['Available', 'Coming soon', 'Planned']),
    );
  });
});
