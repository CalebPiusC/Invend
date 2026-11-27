import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../components/marketing/homepage';
import { checkSampleOffer, sampleMoney, sampleSale } from '../components/marketing/demo-data';
import AppPage from '../app/app/page';
import { DataProvider } from '../components/data/provider';

const observers: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
beforeEach(() => {
  window.history.replaceState(null, '', '/');
  document.body.style.overflow = '';
  observers.length = 0;
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor() {
        observers.push(this);
      }
    },
  );
  // jsdom has no native modal implementation; browser QA checks the real focus trap/inertness.
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
  window.history.replaceState(null, '', '/');
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
});
const sample = (testId: string) => within(screen.getByTestId(testId));
async function chooseFeature(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('tab', { name }));
  return within(screen.getByRole('tabpanel', { name }));
}

describe('redesigned public homepage', () => {
  it('isolates marketing from tenant providers and brings a phone-first illustration into the hero', () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Every customer conversation. Every order. One workspace.',
    );
    const hero = document.getElementById('home')!;
    expect(hero.querySelector('img')).not.toBeNull();
    expect(
      within(hero)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/app?auth=sign-up', '#how-it-works', '/app']);
    expect(hero).toContainElement(screen.getByTestId('workspace-preview'));
    expect(hero).toContainElement(screen.getByTestId('hero-phone'));
    expect(document.getElementById('home')!.nextElementSibling).toBe(
      document.getElementById('integrations'),
    );
    expect(screen.getByTestId('workspace-preview')).toHaveTextContent(
      'Fictional data · no live connections',
    );
    expect(screen.getByTestId('workspace-preview')).toHaveTextContent(sampleSale.vendor);
    expect(screen.getByTestId('workflow-stack')).toHaveTextContent(sampleSale.vendor);
    expect(screen.getByTestId('workflow-stack')).toHaveTextContent(sampleSale.orderId);
    expect(screen.queryByTestId('sample-label')).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('has the required section sequence and exactly seven ordered navigation destinations', () => {
    render(<Homepage />);
    expect([...document.querySelectorAll('main > section')].map((section) => section.id)).toEqual([
      'home',
      'integrations',
      'the-problem',
      'the-solution',
      'features',
      'how-it-works',
      'owner-control',
      'pricing',
      'about',
      '',
    ]);
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    expect(
      [...screen.getByRole('navigation', { name: 'Main navigation' }).children].map((control) => [
        control.textContent?.trim(),
        control.getAttribute('href') ?? control.getAttribute('aria-controls'),
      ]),
    ).toEqual([
      ['Home', '#home'],
      ['Features', 'features-mega-menu'],
      ['How it works', '#how-it-works'],
      ['Pricing', '#pricing'],
      ['About', '#about'],
    ]);
    expect(nav.getByRole('button', { name: 'Features' })).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(screen.getByRole('navigation', { name: 'Account navigation' }))
        .getAllByRole('link')
        .map((link) => [link.textContent?.trim(), link.getAttribute('href')]),
    ).toEqual([
      ['Sign in', '/app?auth=sign-in'],
      ['Get started', '/app?auth=sign-up'],
    ]);
    expect(within(screen.getByTestId('workflow-stack')).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('locks the background, closes the mobile menu on selection and restores normal scrolling', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    document.body.style.overflow = 'clip';
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const dialog = screen.getByRole('dialog', { name: 'Site navigation' });
    const mobile = within(dialog);
    // jsdom exposes closed <details> descendants; the real-browser test checks their hidden state.
    expect(mobile.getAllByRole('link').filter((link) => !link.closest('details'))).toHaveLength(6);
    expect(dialog.querySelector('details')).not.toHaveAttribute('open');
    expect(mobile.getByRole('link', { name: /Home/ })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(mobile.getByText('Features', { exact: true }));
    await user.click(mobile.getByRole('link', { name: 'Explore all features' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).not.toHaveAttribute('open');
    expect(document.body.style.overflow).toBe('clip');
  });

  it('handles native dialog cancellation and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    await user.click(toggle);
    const menu = within(screen.getByRole('dialog'));
    menu.getByRole('link', { name: 'Get started' }).focus();
    await user.keyboard('{Tab}');
    expect(menu.getByRole('button', { name: 'Close navigation' })).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(menu.getByRole('link', { name: 'Get started' })).toHaveFocus();
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.style.overflow).toBe('');
  });

  it('cleans up navigation observers and page-only scroll styling on unmount', () => {
    const { unmount } = render(<Homepage />);
    expect(observers).toHaveLength(3);
    expect(observers[0].observe).toHaveBeenCalledTimes(1);
    expect(observers[1].observe).toHaveBeenCalledTimes(10);
    expect(observers[1].observe).toHaveBeenCalledWith(document.getElementById('home'));
    expect(observers[1].observe).toHaveBeenCalledWith(document.getElementById('integrations'));
    expect(observers[1].observe).toHaveBeenCalledWith(document.getElementById('the-problem'));
    expect(observers[2].observe).toHaveBeenCalledWith(screen.getByTestId('integration-map'));
    expect(document.documentElement.dataset.marketing).toBe('true');
    unmount();
    observers.forEach((observer) => expect(observer.disconnect).toHaveBeenCalled());
    expect(document.documentElement.dataset.marketing).toBeUndefined();
  });

  it('uses a single coordinated eight-feature preview with roving keyboard selection', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(8);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    tabs[0].focus();
    await user.keyboard('{ArrowDown}');
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('AI-Assisted Customer Conversations');
    await user.keyboard('{End}');
    expect(tabs[7]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tabs[0]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tabs[7]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tabs[0]).toHaveFocus();
    expect(tabs.filter((tab) => tab.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('supports the mobile feature picker and legacy feature anchors', async () => {
    window.history.replaceState(null, '', '/#smart-catalogue');
    const user = userEvent.setup();
    render(<Homepage />);
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Photo-First Catalogue');
    await user.selectOptions(screen.getByRole('combobox', { name: /Choose a feature/ }), '6');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Business Insights');
    window.history.replaceState(null, '', '/#team-management');
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Team Management');
    expect(document.getElementById('team-management')).not.toBeNull();
  });

  it('changes customer context while keeping channel previews honest', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const demo = sample('tour-inbox');
    await user.click(demo.getByRole('button', { name: /Lola Adeyemi/ }));
    expect(demo.getByText('WhatsApp · fictional conversation')).toBeInTheDocument();
    expect(demo.getByText(/12 indigo totes at ₦12,000/)).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: /Chidi Okafor/ }));
    expect(demo.getByText(/Yaba, Lagos · delivery enquiry/)).toBeInTheDocument();
    expect(demo.getByText(/still need live-provider validation/)).toBeInTheDocument();
    await chooseFeature(user, 'Business Insights');
    await chooseFeature(user, 'Smart Customer Inbox');
    expect(demo.getByRole('button', { name: /Chidi Okafor/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('checks exact minimum prices without sending anything', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    render(<Homepage />);
    const panel = await chooseFeature(user, 'AI-Assisted Customer Conversations');
    expect(panel.getByRole('status')).toHaveTextContent('₦2,000 below your minimum');
    await user.click(panel.getByRole('button', { name: '₦22,000' }));
    expect(panel.getByRole('status')).toHaveTextContent('Inside your price boundary');
    expect(panel.getByRole('status')).toHaveTextContent('this is not a sale');
    await user.click(panel.getByRole('button', { name: '₦20,000' }));
    expect(panel.getByRole('status')).toHaveTextContent('Owner review required');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('requires a fresh review after stock edits and never saves a real catalogue item', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    render(<Homepage />);
    const panel = await chooseFeature(user, 'Photo-First Catalogue');
    await user.click(panel.getByRole('button', { name: 'Review sample details' }));
    expect(panel.getByRole('checkbox')).toHaveFocus();
    expect(panel.getByRole('button', { name: 'Confirm sample product' })).toBeDisabled();
    await user.click(panel.getByRole('checkbox'));
    await user.click(panel.getByRole('button', { name: 'Increase sample stock' }));
    expect(panel.getByLabelText('Sample stock count')).toHaveTextContent('13');
    expect(panel.getByRole('checkbox')).not.toBeChecked();
    expect(panel.getByRole('button', { name: 'Confirm sample product' })).toBeDisabled();
    await user.click(panel.getByRole('checkbox'));
    await user.click(panel.getByRole('button', { name: 'Confirm sample product' }));
    expect(panel.getByRole('status', { name: 'Sample product review' })).toHaveTextContent(
      'No product or photo was saved',
    );
    expect(panel.getByRole('status', { name: 'Sample product review' })).toHaveFocus();
    await user.click(panel.getByRole('button', { name: 'Reset' }));
    expect(panel.getByRole('button', { name: 'Review sample details' })).toBeEnabled();
    expect(panel.getByRole('button', { name: 'Review sample details' })).toHaveFocus();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps orders in a reviewable, unpaid state before the payment step', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const panel = await chooseFeature(user, 'Order Management');
    expect(panel.getByText('₦23,500', { exact: true })).toBeInTheDocument();
    await user.click(panel.getByRole('button', { name: 'Create sample draft' }));
    expect(panel.getByRole('listitem', { current: 'step' })).toHaveTextContent('Order draft');
    await user.click(panel.getByRole('button', { name: 'Review sample order' }));
    expect(panel.getByText('Payment not confirmed', { exact: true })).toBeInTheDocument();
    await user.click(panel.getByRole('button', { name: 'Explore payment tracking' }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Payment Tracking');
    expect(screen.getByRole('tab', { name: 'Payment Tracking' })).toHaveFocus();
  });

  it('never verifies a screenshot, requires explicit vendor confirmation, and revokes the receipt on reset', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    render(<Homepage />);
    let receipt = await chooseFeature(user, 'Digital Receipts');
    expect(receipt.queryByText('SAMPLE RECEIPT', { exact: true })).not.toBeInTheDocument();
    await user.click(receipt.getByRole('button', { name: 'Review sample payment' }));
    const payment = within(screen.getByRole('tabpanel', { name: 'Payment Tracking' }));
    await user.click(payment.getByRole('button', { name: 'Test a payment screenshot' }));
    expect(payment.getByRole('status')).toHaveTextContent('Payment is still unconfirmed');
    expect(payment.getByRole('button', { name: 'Record sample confirmation' })).toBeDisabled();
    await user.click(payment.getByRole('checkbox', { name: /verified this sample payment/ }));
    await user.click(payment.getByRole('button', { name: 'Record sample confirmation' }));
    expect(payment.getByRole('status')).toHaveTextContent('No real transfer was verified');
    await user.click(payment.getByRole('button', { name: 'View sample receipt' }));
    receipt = within(screen.getByRole('tabpanel', { name: 'Digital Receipts' }));
    expect(receipt.getByText('SAMPLE RECEIPT', { exact: true })).toBeInTheDocument();
    expect(receipt.getByText('₦23,500', { exact: true })).toBeInTheDocument();
    expect(receipt.getByText(/Not proof of a real payment/)).toBeInTheDocument();
    await chooseFeature(user, 'Payment Tracking');
    await user.click(payment.getByRole('button', { name: 'Reset' }));
    receipt = await chooseFeature(user, 'Digital Receipts');
    expect(receipt.queryByText('SAMPLE RECEIPT', { exact: true })).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('updates fictional chart values and exposes a textual equivalent', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const panel = await chooseFeature(user, 'Business Insights');
    expect(panel.getByRole('img')).toHaveAccessibleName(
      /Fictional orders: Mon 2, Tue 3, Wed 1, Thu 4, Fri 3. Total 13/,
    );
    await user.click(panel.getByRole('button', { name: 'Conversations' }));
    expect(panel.getByRole('img')).toHaveAccessibleName(
      /Fictional conversations: Mon 4, Tue 5, Wed 3, Thu 6, Fri 4. Total 22/,
    );
    expect(panel.getByRole('img')).toHaveAccessibleName(/Not business performance/);
    expect(panel.getByText('Sample data only')).toBeInTheDocument();
  });

  it('demonstrates assignment and human takeover without transferring owner authority', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const panel = await chooseFeature(user, 'Team Management');
    await user.selectOptions(panel.getByRole('combobox'), 'Bisi');
    expect(panel.getByRole('status')).toHaveTextContent('Assigned to Bisi in this demo');
    await user.click(panel.getByRole('button', { name: 'Take over sample conversation' }));
    expect(panel.getByText('Assistant replies paused', { exact: true })).toBeInTheDocument();
    await user.click(panel.getByRole('button', { name: 'Hand back to assistant' }));
    expect(panel.getByRole('status')).toHaveTextContent('Rule-bound assistance can resume');
    expect(panel.getByText(/Owner · role protected/)).toBeInTheDocument();
    expect(panel.getByText(/does not transfer owner authority/)).toBeInTheDocument();
  });

  it('supports approve, guarded edit and reject with explicit no-send results', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    render(<Homepage />);
    const demo = sample('owner-decision-demo');
    await user.click(demo.getByRole('button', { name: 'Edit' }));
    const input = demo.getByRole('textbox', { name: /Counter-offer/ });
    await user.clear(input);
    await user.type(input, '20000');
    await user.click(demo.getByRole('button', { name: 'Save sample edit' }));
    expect(demo.getByRole('alert')).toHaveTextContent('between ₦22,000 and ₦24,000');
    await user.clear(input);
    await user.type(input, '23000.50');
    await user.click(demo.getByRole('button', { name: 'Save sample edit' }));
    expect(demo.getByRole('status')).toHaveTextContent('Still waiting for your approval');
    expect(demo.getByText(/for ₦23,000.50, plus/)).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: 'Approve' }));
    expect(demo.getByRole('status')).toHaveTextContent(
      'No message sent. No order saved. Customer acceptance and payment are still pending.',
    );
    await user.click(demo.getByRole('button', { name: 'Reset example' }));
    await user.click(demo.getByRole('button', { name: 'Reject' }));
    expect(demo.getByRole('status')).toHaveTextContent('The proposed reply was not sent');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(['', 'not a price', '-22000', '22000.001', '25000'])(
    'rejects an invalid or out-of-bounds edited offer: %s',
    async (value) => {
      const user = userEvent.setup();
      render(<Homepage />);
      const demo = sample('owner-decision-demo');
      await user.click(demo.getByRole('button', { name: 'Edit' }));
      const input = demo.getByRole('textbox', { name: /Counter-offer/ });
      await user.clear(input);
      if (value) await user.type(input, value);
      await user.click(demo.getByRole('button', { name: 'Save sample edit' }));
      expect(demo.getByRole('alert')).toBeInTheDocument();
      expect(demo.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    },
  );

  it('discloses every integration status and never substitutes sample offers for real pricing', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const map = sample('integration-map');
    expect(map.getAllByText('Coming soon')).toHaveLength(3);
    expect(map.getAllByText('Planned')).toHaveLength(3);
    expect(map.getAllByText('Available')).toHaveLength(1);
    await user.click(document.querySelector('#integration-readiness > summary')!);
    const integration = sample('integration-status');
    expect(integration.getAllByRole('listitem')).toHaveLength(7);
    expect(integration.getAllByRole('listitem')[0]).toHaveTextContent('Second major channel');
    expect(integration.getAllByRole('listitem')[1]).toHaveTextContent('First planned live channel');
    expect(integration.getAllByText('Coming soon')).toHaveLength(3);
    expect(integration.getAllByRole('listitem')[0]).toHaveTextContent('Meta approval');
    expect(integration.getAllByRole('listitem')[1]).toHaveTextContent(
      'live acceptance remain pending',
    );
    expect(screen.getByTestId('integration-status')).toHaveTextContent(
      'TikTok messaging remains research-only',
    );
    expect(screen.getByTestId('integration-status')).toHaveTextContent(
      'SMS is exploratory and unsupported',
    );
    expect(integration.getAllByRole('listitem')[6]).toHaveTextContent(
      'CSV/XLSX export is not implemented',
    );
    expect(document.getElementById('pricing')).toHaveTextContent('Not yet published');
    expect(document.getElementById('pricing')).not.toHaveTextContent(
      /Starter|Growth|Scale|₦|free trial|recommended|most popular/i,
    );
    expect(document.getElementById('about')).toHaveTextContent('AI Commerce Growth Platform');
  });

  it('keeps all auth, section and footer links real without invented contact or legal destinations', () => {
    render(<Homepage />);
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = anchor.getAttribute('href')!;
      if (href.startsWith('#')) expect(document.getElementById(href.slice(1))).not.toBeNull();
      else expect(['/app', '/app?auth=sign-in', '/app?auth=sign-up']).toContain(href);
    }
    expect(
      screen
        .getAllByRole('link', { name: /^Get started/i })
        .every((link) => link.getAttribute('href') === '/app?auth=sign-up'),
    ).toBe(true);
  });
});

describe('fictional offer guardrails', () => {
  it.each([1_999_999, 2_000_000, 2_199_999])('requires review for an offer of %i kobo', (offer) => {
    expect(checkSampleOffer(offer).needsApproval).toBe(true);
    expect(checkSampleOffer(offer).minimumKobo).toBe(2_200_000);
  });
  it.each([2_200_000, 2_400_000])('accepts an offer inside the demo boundary: %i kobo', (offer) => {
    expect(checkSampleOffer(offer)).toEqual({
      needsApproval: false,
      minimumKobo: 2_200_000,
      shortfallKobo: 0,
    });
  });
  it.each([0, -1, 0.5, NaN, Infinity])('rejects invalid demo money: %s', (offer) => {
    expect(() => checkSampleOffer(offer)).toThrow(RangeError);
  });
  it('keeps the narrative order total and fractional edits exact', () => {
    expect(
      sampleMoney(
        sampleSale.quantity * sampleSale.minimumUnitPriceKobo + sampleSale.deliveryFeeKobo,
      ),
    ).toBe('₦23,500');
    expect(sampleMoney(2_300_050)).toBe('₦23,000.50');
  });
});

describe('workspace route continuity', () => {
  it('keeps the separate sample workspace', async () => {
    vi.stubEnv('DATA_MODE', 'mock');
    const page = await AppPage({ searchParams: Promise.resolve({}) });
    expect(page.type).toBe(DataProvider);
    expect(page.props.mode).toBe('mock');
  });
  it.each(['sign-in', 'sign-up'])('keeps %s as real auth, not a fictional login', async (auth) => {
    vi.stubEnv('DATA_MODE', 'mock');
    const page = await AppPage({ searchParams: Promise.resolve({ auth }) });
    expect(page.props.mode).toBe('api');
  });
});
