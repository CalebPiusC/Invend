import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NegotiationDemo,
  CatalogueDemo,
  InboxDemo,
  LeadDemo,
  OrderJourney,
  HumanControlDemo,
} from '../components/marketing/product-walkthrough';

// Existing reusable demonstrations keep their original safety coverage independently of the new tour.
afterEach(() => vi.unstubAllGlobals());
function sample(testId: string) {
  return within(screen.getByTestId(testId));
}

describe('retained marketing workflow guardrails', () => {
  it('escalates a below-floor offer, uses the exact minimum and never sends a reply', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<NegotiationDemo />);
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
    render(<CatalogueDemo />);
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
    render(<InboxDemo />);
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
    render(<LeadDemo />);
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
    render(<OrderJourney />);
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
    render(<HumanControlDemo />);
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
});
