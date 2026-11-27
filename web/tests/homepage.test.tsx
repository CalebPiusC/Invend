import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../components/marketing/homepage';
import { checkSampleOffer, sampleMoney, sampleSale } from '../components/marketing/demo-data';
import AppPage from '../app/app/page';
import { DataProvider } from '../components/data/provider';

// jsdom has no layout/scroll implementation. Real anchor clearance is checked in tests/homepage.mjs.
const scrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: scrollIntoView,
});
beforeEach(() => {
  window.history.replaceState(null, '', '/');
  scrollIntoView.mockClear();
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function sample(testId: string) {
  return within(screen.getByTestId(testId));
}
async function openWorkflow(user: ReturnType<typeof userEvent.setup>, id: string) {
  const details = document.getElementById(id) as HTMLDetailsElement;
  await user.click(details.querySelector('summary')!);
  expect(details.open).toBe(true);
}

describe('public homepage', () => {
  it('introduces the product without mounting tenant providers or requesting business data', () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'More sales.Still your call.',
    );
    expect(screen.getByTestId('hero-sales-demo')).toHaveTextContent(
      'Gmail · fictional conversation',
    );
    expect(screen.getByTestId('workspace-preview')).toHaveTextContent('Illustrative workspace');
    expect(screen.queryByTestId('sample-label')).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: /^Get started/ })
        .every((link) => link.getAttribute('href') === '/app?auth=sign-up'),
    ).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps enquiry, recommendation, draft and owner approval distinct without making a real sale', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    const hero = sample('hero-sales-demo');
    expect(hero.getByText(/Hi! Do you have two indigo totes/)).toBeInTheDocument();
    expect(hero.getByText(/Two are ₦24,000, plus ₦1,500 delivery/)).toBeInTheDocument();
    expect(hero.queryByText(sampleSale.orderId)).not.toBeInTheDocument();
    await user.click(hero.getByRole('button', { name: 'Build a sample draft' }));
    expect(hero.getByText(sampleSale.orderId)).toBeInTheDocument();
    expect(hero.getByText('Not yet approved')).toBeInTheDocument();
    expect(hero.getByText('₦23,500', { exact: true })).toBeInTheDocument();
    expect(
      hero.getByText('Customer acceptance and payment are still pending.'),
    ).toBeInTheDocument();
    expect(
      hero.queryByRole('button', { name: 'Approve demo counter-offer' }),
    ).not.toBeInTheDocument();
    await user.click(hero.getByRole('button', { name: 'Review owner approval' }));
    expect(hero.getByText('Not yet approved')).toBeInTheDocument();
    await user.click(hero.getByRole('button', { name: 'Approve demo counter-offer' }));
    expect(hero.getByText('Reviewed by Tola · owner')).toBeInTheDocument();
    expect(hero.getByRole('status')).toHaveTextContent('No message was sent or order saved.');
    expect(
      hero.getByText('Customer acceptance and payment are still pending.'),
    ).toBeInTheDocument();
    await user.click(hero.getByRole('button', { name: 'Restart example' }));
    expect(hero.getByRole('button', { name: 'Build a sample draft' })).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('keeps all six workflows compact, labelled and available without discarding local demo state', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const explorer = screen.getByTestId('workflow-explorer');
    const workflows = explorer.querySelectorAll<HTMLDetailsElement>('details');
    expect(workflows).toHaveLength(6);
    expect([...workflows].every((workflow) => !workflow.open)).toBe(true);
    expect(
      [...workflows].every((workflow) => workflow.getAttribute('name') === 'invend-workflows'),
    ).toBe(true);
    expect(explorer).toHaveTextContent('Nothing is sent or saved.');
    await openWorkflow(user, 'negotiation');
    await user.click(sample('negotiation-demo').getByRole('button', { name: '₦22,000' }));
    await user.click(document.querySelector('#negotiation > summary')!);
    expect(document.getElementById('negotiation')).not.toHaveAttribute('open');
    await openWorkflow(user, 'negotiation');
    expect(sample('negotiation-demo').getByText('Within the price boundary')).toBeInTheDocument();
  });

  it('opens a directly linked workflow and reopens it on a repeated dashboard link', async () => {
    window.history.replaceState(null, '', '/#smart-catalogue');
    const user = userEvent.setup();
    render(<Homepage />);
    const details = document.getElementById('smart-catalogue') as HTMLDetailsElement;
    expect(details.open).toBe(true);
    await user.click(details.querySelector('summary')!);
    expect(details.open).toBe(false);
    const link = screen
      .getByTestId('workspace-preview')
      .querySelector('a[href="#smart-catalogue"]')!;
    await user.click(link);
    expect(details.open).toBe(true);
    await user.click(details.querySelector('summary')!);
    await user.click(link);
    expect(details.open).toBe(true);
  });

  it('shows roadmap priority rather than suggesting the illustrated integrations are connected', () => {
    render(<Homepage />);
    const map = sample('integration-map');
    expect(map.getByText('01 / First priority')).toBeInTheDocument();
    expect(map.getByText('02 / Next priority')).toBeInTheDocument();
    expect(map.getAllByText('Live validation pending')).toHaveLength(2);
    expect(map.getAllByText('Planned · not available')).toHaveLength(2);
    expect(map.getByText(/lines do not represent live connections/)).toBeInTheDocument();
    expect(screen.getByTestId('workspace-preview')).toHaveTextContent('No live connections.');
  });

  it('labels every pricing concept as a preview, not a subscription purchase', () => {
    render(<Homepage />);
    const pricing = within(document.getElementById('pricing')!);
    for (const name of ['Starter', 'Growth', 'Scale']) {
      const plan = pricing.getByRole('article', { name: `${name} plan preview` });
      expect(plan).toHaveTextContent('Pricing to be confirmed');
      expect(within(plan).getByRole('link')).toHaveAttribute('href', '/app');
    }
    expect(
      pricing.getByText(/Illustrative plan previews, not established plans/),
    ).toBeInTheDocument();
    expect(document.getElementById('pricing')).not.toHaveTextContent(
      /\$\d|most popular|free trial/i,
    );
  });

  it('opens grouped feature navigation with a keyboard and restores focus with Escape', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    const mobile = screen.getByRole('button', { name: 'Open navigation' });
    await user.click(mobile);
    expect(mobile).toHaveAttribute('aria-expanded', 'true');
    const features = screen.getByRole('button', { name: 'Features' });
    features.focus();
    await user.keyboard('{ArrowDown}');
    const panel = document.getElementById('feature-navigation')!;
    expect(within(panel).getAllByRole('link')).toHaveLength(7);
    expect(within(panel).getByRole('link', { name: /AI Sales Assistant/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(features).toHaveAttribute('aria-expanded', 'false');
    expect(features).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(within(panel).getByRole('link', { name: /Integrations/ })).toHaveFocus();
    await user.keyboard('{Escape}{Escape}');
    expect(mobile).toHaveAttribute('aria-expanded', 'false');
    expect(mobile).toHaveFocus();
  });

  it('closes navigation on a feature choice and gives every public link a real destination', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    await user.click(screen.getByRole('button', { name: 'Features' }));
    await user.click(screen.getByRole('link', { name: /Smart Catalogue Start/ }));
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = anchor.getAttribute('href')!;
      if (href.startsWith('#')) expect(document.getElementById(href.slice(1))).not.toBeNull();
      else expect(['/app', '/app?auth=sign-in', '/app?auth=sign-up']).toContain(href);
    }
  });

  it('escalates a below-floor offer, uses the exact minimum and never sends a reply', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    await openWorkflow(user, 'negotiation');
    const demo = sample('negotiation-demo');
    expect(demo.getByText('Owner review required')).toBeInTheDocument();
    expect(demo.getByText('₦2,000 below your minimum.')).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: 'Approve sample counter-offer' }));
    expect(demo.getByRole('status')).toHaveTextContent(
      'No message was sent and no order was changed.',
    );
    await user.click(demo.getByRole('button', { name: '₦22,000' }));
    expect(demo.getByText('Within the price boundary')).toBeInTheDocument();
    expect(
      demo.queryByRole('button', { name: 'Approve sample counter-offer' }),
    ).not.toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: 'Reset demo' }));
    expect(demo.getByText('Owner review required')).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('requires photo-detail review and explicit confirmation without saving a real product', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    await openWorkflow(user, 'smart-catalogue');
    const demo = sample('catalogue-demo');
    await user.click(demo.getByRole('button', { name: 'Review sample details' }));
    expect(demo.getByRole('button', { name: 'Confirm sample product' })).toBeDisabled();
    await user.click(demo.getByRole('button', { name: 'Increase sample stock' }));
    expect(demo.getByRole('status', { name: 'Sample stock count' })).toHaveTextContent('13');
    await user.click(demo.getByRole('checkbox', { name: /checked these sample details/ }));
    await user.click(demo.getByRole('button', { name: 'Confirm sample product' }));
    expect(demo.getByText(/No product or photo was saved/)).toBeInTheDocument();
    expect(demo.getByRole('button', { name: 'Confirmed in the demo' })).toBeDisabled();
    await user.click(demo.getByRole('button', { name: 'Reset demo' }));
    expect(demo.getByRole('button', { name: 'Review sample details' })).toBeEnabled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('selects customer context without claiming a planned channel is connected', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await openWorkflow(user, 'unified-inbox');
    const demo = sample('inbox-demo');
    await user.click(demo.getByRole('button', { name: /Chidi Okafor/ }));
    expect(demo.getByText('Instagram · fictional conversation')).toBeInTheDocument();
    expect(demo.getByText('Asked about delivery · Yaba')).toBeInTheDocument();
    expect(demo.getByText(/including a planned integration/)).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: /Lola Adeyemi/ }));
    expect(demo.getByText('WhatsApp · fictional conversation')).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: /Amaka Bello/ }));
    expect(demo.getByText('Gmail / Email · fictional conversation')).toBeInTheDocument();
  });

  it('requires sample consent before queuing a follow-up and clearly labels manual lead stages', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await openWorkflow(user, 'lead-management');
    const demo = sample('lead-demo');
    expect(demo.getByRole('button', { name: 'Queue sample follow-up' })).toBeDisabled();
    await user.click(demo.getByRole('button', { name: /Ready to buy/ }));
    expect(demo.getByRole('button', { name: /Ready to buy/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(demo.getByRole('checkbox'));
    await user.click(demo.getByRole('button', { name: 'Queue sample follow-up' }));
    expect(demo.getByRole('status')).toHaveTextContent('No message will be sent.');
    expect(
      demo.getByText(/Automatic live lead qualification is still in development/),
    ).toBeInTheDocument();
  });

  it('never turns a screenshot into payment confirmation and gates the sample receipt on vendor confirmation', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    await openWorkflow(user, 'orders-and-payments');
    const demo = sample('order-demo');
    expect(demo.getByText('₦23,500', { exact: true })).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: 'Create sample draft' }));
    await user.click(demo.getByRole('button', { name: 'Review payment step' }));
    await user.click(demo.getByRole('button', { name: 'Test a payment screenshot' }));
    expect(demo.getByText('Payment not confirmed', { exact: true })).toBeInTheDocument();
    expect(demo.getByRole('button', { name: 'Record sample confirmation' })).toBeDisabled();
    expect(demo.queryByText('SAMPLE RECEIPT', { exact: true })).not.toBeInTheDocument();
    await user.click(demo.getByRole('checkbox', { name: /verified this sample payment/ }));
    await user.click(demo.getByRole('button', { name: 'Record sample confirmation' }));
    expect(demo.getByText('SAMPLE RECEIPT', { exact: true })).toBeInTheDocument();
    expect(
      demo.getByText('Illustrative receipt. Not proof of a real payment.'),
    ).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: 'Reset demo' }));
    expect(demo.getByText('Payment not confirmed', { exact: true })).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('shows takeover, hand-back, staff assignment and owner accountability without mutating an account', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Homepage />);
    await openWorkflow(user, 'team-management');
    const demo = sample('control-demo');
    await user.click(demo.getByRole('button', { name: 'Take over demo conversation' }));
    expect(demo.getByText('AI replies are paused in this demonstration.')).toBeInTheDocument();
    await user.click(demo.getByRole('button', { name: 'Hand back to assistant' }));
    expect(demo.getByRole('status')).toHaveTextContent('Rule-bound assistant replies can resume.');
    await user.selectOptions(demo.getByRole('combobox'), 'Bisi');
    expect(demo.getByRole('status')).toHaveTextContent('assigned to Bisi');
    await user.click(demo.getByRole('button', { name: 'Approve sample reply' }));
    expect(demo.getByText('REVIEWED BY TOLA · OWNER')).toBeInTheDocument();
    expect(demo.getByRole('status')).toHaveTextContent('No message was sent.');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('discloses all six integration states and does not invent software prices', async () => {
    const user = userEvent.setup();
    render(<Homepage />);
    await openWorkflow(user, 'integration-readiness');
    const demo = sample('integration-status');
    expect(demo.getAllByRole('listitem')).toHaveLength(6);
    expect(demo.getAllByRole('listitem')[0]).toHaveTextContent('Gmail / Email');
    expect(demo.getAllByRole('listitem')[1]).toHaveTextContent('WhatsApp');
    expect(demo.getAllByText('Built · live validation pending')).toHaveLength(2);
    expect(demo.getAllByText('Planned', { exact: true })).toHaveLength(2);
    expect(demo.getByText('SMS', { exact: true }).closest('li')).toHaveTextContent(
      'Exploring · not supported',
    );
    expect(demo.getByText('TikTok', { exact: true }).closest('li')).toHaveTextContent(
      'Under review',
    );
    expect(document.getElementById('pricing')).toHaveTextContent('not published in this preview');
    expect(document.getElementById('about')).toHaveTextContent('AI Commerce Growth Platform');
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
  it('keeps the narrative order total consistent in integer kobo', () => {
    expect(
      sampleMoney(
        sampleSale.quantity * sampleSale.minimumUnitPriceKobo + sampleSale.deliveryFeeKobo,
      ),
    ).toBe('₦23,500');
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
