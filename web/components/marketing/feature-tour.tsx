'use client';
import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  FileText,
  Hand,
  Inbox,
  LockKeyhole,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import { checkSampleOffer, sampleSale as sale, sampleMoney as money } from './demo-data';
import styles from './feature-tour.module.css';

const features = [
  {
    name: 'Smart Customer Inbox',
    title: 'The customer. Not just the message.',
    description:
      'Keep the conversation and its next step together. Select a fictional customer to see the context change.',
    status: 'Implemented workflow · live channels pending',
    icon: Inbox,
  },
  {
    name: 'AI-Assisted Customer Conversations',
    title: 'A helpful reply. A firm boundary.',
    description:
      'Known business facts and deterministic price rules come first. Try a customer offer below or inside the minimum.',
    status: 'Rule-bound assistance · not unrestricted AI',
    icon: MessageCircle,
  },
  {
    name: 'Photo-First Catalogue',
    title: 'Start with a photo. Confirm the facts.',
    description:
      'Photos help start a product draft. You supply and review names, variants, prices and stock before confirming.',
    status: 'Interactive prototype · live catalogue in development',
    icon: Camera,
  },
  {
    name: 'Order Management',
    title: 'An agreement becomes a clear record.',
    description:
      'Bring agreed items and delivery details into a draft you can review. Nothing here creates a real order.',
    status: 'Implemented workflow · rollout validation pending',
    icon: Package,
  },
  {
    name: 'Payment Tracking',
    title: 'A claim is not a confirmation.',
    description:
      'Customers pay your business directly. Record payment only after you or an appropriately verified integration confirms it.',
    status: 'Vendor confirmation · not independent bank verification',
    icon: Wallet,
  },
  {
    name: 'Digital Receipts',
    title: 'A record of what was confirmed.',
    description:
      'Keep the agreed items and the payment confirmation together. This example unlocks only after sample vendor confirmation.',
    status: 'Confirmation-gated workflow · live acceptance pending',
    icon: ReceiptText,
  },
  {
    name: 'Business Insights',
    title: 'See the story in your recorded activity.',
    description:
      'Review historical order and conversation activity. Explore the fictional dataset below—not a forecast or a performance claim.',
    status: 'Partial implementation · live-data validation pending',
    icon: BarChart3,
  },
  {
    name: 'Team Management',
    title: 'An extra pair of hands. Clear responsibility.',
    description:
      'Keep assignments and owner decisions visible. Try a sample assignment or pause assistant replies by taking over.',
    status: 'Partial implementation · invitations and roles need acceptance',
    icon: Users,
  },
] as const;

const legacyFeatures: Record<string, number> = {
  'unified-inbox': 0,
  'lead-management': 0,
  'ai-sales-assistant': 1,
  negotiation: 1,
  'smart-catalogue': 2,
  'orders-and-payments': 3,
  'team-management': 7,
};

function DemoFoot({ children, onReset }: { children: React.ReactNode; onReset?: () => void }) {
  return (
    <div className={styles.demoFoot}>
      <p>{children}</p>
      {onReset && (
        <button type="button" onClick={onReset}>
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      )}
    </div>
  );
}

function InboxPreview() {
  const [selected, setSelected] = useState(0);
  const conversations = [
    {
      name: 'Amaka Bello',
      initials: 'AB',
      channel: 'Gmail',
      stage: 'Price review',
      question: 'Can you do the two indigo totes for ₦20,000?',
      context: 'Two gifts · delivery to Yaba',
      response:
        'This offer is below your ₦22,000 minimum for two. An owner decision is needed before a counter-offer is sent.',
    },
    {
      name: 'Lola Adeyemi',
      initials: 'LA',
      channel: 'WhatsApp',
      stage: 'Product question',
      question: 'Is the indigo tote in stock?',
      context: 'One tote · checking availability',
      response:
        'The vendor-supplied sample catalogue lists 12 indigo totes at ₦12,000 each. These are fictional facts, not a live stock check.',
    },
    {
      name: 'Chidi Okafor',
      initials: 'CO',
      channel: 'Gmail',
      stage: 'Delivery question',
      question: 'How much is delivery to Yaba?',
      context: 'Yaba, Lagos · delivery enquiry',
      response:
        'The vendor’s sample delivery rule lists ₦1,500 for Yaba. Confirm the order details before promising fulfilment.',
    },
  ];
  const current = conversations[selected];
  return (
    <div className={styles.inboxPreview} data-testid="tour-inbox">
      <div className={styles.miniBar}>
        <span>
          <Inbox size={15} aria-hidden="true" /> Inbox
        </span>
        <span>FICTIONAL CONVERSATIONS</span>
      </div>
      <div className={styles.inboxGrid}>
        <div className={styles.customerList} aria-label="Sample conversations">
          {conversations.map((customer, i) => (
            <button
              type="button"
              key={customer.name}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <span className={styles.avatar}>{customer.initials}</span>
              <span>
                <strong>{customer.name}</strong>
                <small>{customer.channel} · sample</small>
              </span>
              <ChevronRight size={13} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={styles.conversation}>
          <div className={styles.conversationTitle}>
            <div>
              <strong>{current.name}</strong>
              <span>{current.channel} · fictional conversation</span>
            </div>
            <span className={styles.pill}>{current.stage}</span>
          </div>
          <p className={styles.customerBubble}>“{current.question}”</p>
          <div className={styles.assistantBubble}>
            <span>
              <BrandIcon size={22} /> A fact-aware next step
            </span>
            <p>{current.response}</p>
          </div>
          <div className={styles.context}>
            <Package size={16} aria-hidden="true" />
            <span>{current.context}</span>
          </div>
        </div>
      </div>
      <DemoFoot>
        Illustrative context only. Gmail and WhatsApp still need live-provider validation.
      </DemoFoot>
    </div>
  );
}

function AssistancePreview() {
  const [offer, setOffer] = useState(2_000_000);
  const result = checkSampleOffer(offer);
  return (
    <div className={styles.assistancePreview} data-testid="tour-assistance">
      <div className={styles.offerHeader}>
        <span className={styles.smallLabel}>YOUR MINIMUM FOR TWO TOTES</span>
        <strong>{money(result.minimumKobo)}</strong>
        <span>2 × ₦11,000. A vendor rule, not an AI estimate.</span>
      </div>
      <div className={styles.offerBody}>
        <p className={styles.smallLabel}>TRY A CUSTOMER’S OFFER</p>
        <div className={styles.offerButtons}>
          {[2_000_000, 2_200_000, 2_400_000].map((value) => (
            <button
              type="button"
              aria-pressed={offer === value}
              key={value}
              onClick={() => setOffer(value)}
            >
              {money(value)}
            </button>
          ))}
        </div>
        <div className={styles.offerResult} role="status">
          <ShieldCheck size={23} aria-hidden="true" />
          <div>
            <strong>
              {result.needsApproval ? 'Owner review required' : 'Inside your price boundary'}
            </strong>
            <p>
              {result.needsApproval
                ? `${money(result.shortfallKobo)} below your minimum. Nothing is promised automatically.`
                : `The ${money(offer)} item total respects your minimum. Delivery is separate; this is not a sale.`}
            </p>
          </div>
        </div>
        <a className={styles.inlineLink} href="#owner-control">
          Try an owner decision <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
      <DemoFoot>Fictional prices. No message sent, no price changed and no order created.</DemoFoot>
    </div>
  );
}

function CataloguePreview() {
  const [reviewing, setReviewing] = useState(false);
  const [checked, setChecked] = useState(false);
  const [stock, setStock] = useState<number>(sale.stock);
  const [confirmed, setConfirmed] = useState(false);
  const reviewTrigger = useRef<HTMLButtonElement>(null);
  const reviewCheck = useRef<HTMLInputElement>(null);
  const reviewResult = useRef<HTMLSpanElement>(null);
  const wasReviewing = useRef(false);
  useEffect(() => {
    if (confirmed) reviewResult.current?.focus({ preventScroll: true });
    else if (reviewing) reviewCheck.current?.focus({ preventScroll: true });
    else if (wasReviewing.current) reviewTrigger.current?.focus({ preventScroll: true });
    wasReviewing.current = reviewing;
  }, [reviewing, confirmed]);
  const id = useId();
  return (
    <div className={styles.cataloguePreview} data-testid="tour-catalogue">
      <div className={styles.catalogueGrid}>
        <div className={styles.photo}>
          <span className={styles.smallLabel}>
            <Camera size={14} aria-hidden="true" /> SAMPLE PRODUCT
          </span>
          <img
            src="/images/adire-tote-indigo.webp"
            alt="AI-generated sample photo of an indigo and cream adire tote"
            loading="lazy"
            width="640"
            height="640"
          />
          <span>AI-generated sample image</span>
        </div>
        <div className={styles.productFacts}>
          <p className={styles.smallLabel}>
            {confirmed
              ? 'CONFIRMED IN THIS DEMO'
              : reviewing
                ? 'REVIEW THE DETAILS'
                : 'PHOTO-FIRST, NOT PHOTO-ONLY'}
          </p>
          <h4>{sale.product}</h4>
          <p>Indigo & cream · cotton</p>
          <dl>
            <div>
              <dt>Vendor-supplied price</dt>
              <dd>₦12,000</dd>
            </div>
            <div>
              <dt>Vendor-supplied stock</dt>
              <dd>{stock} pieces</dd>
            </div>
          </dl>
          {!reviewing ? (
            <button
              ref={reviewTrigger}
              type="button"
              className={styles.action}
              onClick={() => setReviewing(true)}
            >
              Review sample details <ArrowRight size={15} aria-hidden="true" />
            </button>
          ) : (
            <>
              <div className={styles.stockControl}>
                <span>Review stock</span>
                <button
                  type="button"
                  aria-label="Decrease sample stock"
                  disabled={confirmed || stock === 0}
                  onClick={() => {
                    setStock(stock - 1);
                    setChecked(false);
                  }}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <output aria-label="Sample stock count">{stock}</output>
                <button
                  type="button"
                  aria-label="Increase sample stock"
                  disabled={confirmed}
                  onClick={() => {
                    setStock(stock + 1);
                    setChecked(false);
                  }}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
              <label className={styles.checkLabel} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  ref={reviewCheck}
                  disabled={confirmed}
                  onChange={(event) => setChecked(event.target.checked)}
                />
                <span>I’ve checked the sample name, variant, price and stock.</span>
              </label>
              <button
                type="button"
                className={styles.action}
                disabled={!checked || confirmed}
                onClick={() => {
                  if (checked) setConfirmed(true);
                }}
              >
                {confirmed ? 'Confirmed in this demo' : 'Confirm sample product'}
                <Check size={15} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
      <DemoFoot
        onReset={() => {
          setReviewing(false);
          setChecked(false);
          setStock(sale.stock);
          setConfirmed(false);
        }}
      >
        <span ref={reviewResult} tabIndex={-1} role="status" aria-label="Sample product review">
          {confirmed
            ? 'No product or photo was saved. This confirmation exists only in this demonstration.'
            : 'Live extraction, durable photo storage and catalogue editing are in development. Vendor review is required.'}
        </span>
      </DemoFoot>
    </div>
  );
}

function OrderPreview({ onPayment }: { onPayment: () => void }) {
  const [step, setStep] = useState(0);
  return (
    <div className={styles.orderPreview} data-testid="tour-order">
      <ol className={styles.orderProgress} aria-label="Sample order progress">
        {['Agreed details', 'Order draft', 'Reviewed'].map((label, i) => (
          <li key={label} aria-current={step === i ? 'step' : undefined}>
            <span>{i < step ? <Check size={12} aria-hidden="true" /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className={styles.orderContent}>
        <div className={styles.orderCopy}>
          <Package size={30} strokeWidth={1.5} aria-hidden="true" />
          <h4>
            {
              [
                '“Yes, I’ll take the two.”',
                'Check before you confirm.',
                'Ready for the next step.',
              ][step]
            }
          </h4>
          <p>
            {
              [
                'Amaka has accepted the sample counter-offer. Bring the agreed facts into a draft for review.',
                'Two totes, an agreed price and delivery to Yaba. Check each detail before moving forward.',
                'Draft reviewed in this example. Customer payment is still unconfirmed.',
              ][step]
            }
          </p>
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              if (step < 2) setStep(step + 1);
              else onPayment();
            }}
          >
            {['Create sample draft', 'Review sample order', 'Explore payment tracking'][step]}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.orderPaper}>
          <span className={styles.smallLabel}>SAMPLE ORDER · {sale.orderId}</span>
          <strong>{sale.customer}</strong>
          <div className={styles.productLine}>
            <img
              src="/images/adire-tote-indigo.webp"
              alt=""
              loading="lazy"
              width="48"
              height="48"
            />
            <span>
              2 × Everyday adire tote<small>₦11,000 each · agreed sample price</small>
            </span>
          </div>
          <dl className={styles.totals}>
            <div>
              <dt>Items</dt>
              <dd>₦22,000</dd>
            </div>
            <div>
              <dt>Yaba delivery</dt>
              <dd>₦1,500</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>₦23,500</dd>
            </div>
          </dl>
          <span className={styles.pending}>
            <LockKeyhole size={13} aria-hidden="true" />
            Payment not confirmed
          </span>
        </div>
      </div>
      <DemoFoot onReset={() => setStep(0)}>
        A fictional order journey. No real order is saved or fulfilled.
      </DemoFoot>
    </div>
  );
}

function PaymentPreview({
  confirmed,
  onConfirm,
  onReceipt,
  onReset,
}: {
  confirmed: boolean;
  onConfirm: () => void;
  onReceipt: () => void;
  onReset: () => void;
}) {
  const [claim, setClaim] = useState(false);
  const [verified, setVerified] = useState(false);
  const receiptAction = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirmed) receiptAction.current?.focus({ preventScroll: true });
  }, [confirmed]);
  const id = useId();
  return (
    <div className={styles.paymentPreview} data-testid="tour-payment">
      <div className={styles.paymentHeader}>
        <Wallet size={25} strokeWidth={1.5} aria-hidden="true" />
        <div>
          <span className={styles.smallLabel}>SAMPLE PAYMENT RECORD</span>
          <h4>₦23,500</h4>
          <span>Amaka Bello · {sale.orderId}</span>
        </div>
        <span className={styles.pill}>
          {confirmed ? 'Vendor-confirmed · demo' : 'Not confirmed'}
        </span>
      </div>
      <div className={styles.paymentBody}>
        {!confirmed ? (
          <>
            <button type="button" className={styles.claimButton} onClick={() => setClaim(true)}>
              <FileText size={16} aria-hidden="true" />
              Test a payment screenshot
              <Plus size={14} aria-hidden="true" />
            </button>
            <p className={styles.claimNotice} role="status">
              {claim
                ? 'Screenshot received in the demo. Payment is still unconfirmed. A customer claim is not verification.'
                : 'A payment claim can be recorded without being treated as a confirmed payment.'}
            </p>
            <label className={styles.checkLabel} htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                checked={verified}
                onChange={(event) => setVerified(event.target.checked)}
              />
              <span>I have verified this sample payment as the vendor.</span>
            </label>
            <button
              type="button"
              className={styles.action}
              disabled={!verified}
              onClick={() => {
                if (verified) onConfirm();
              }}
            >
              Record sample confirmation <Check size={15} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <div className={styles.confirmedState}>
              <ShieldCheck size={28} strokeWidth={1.5} aria-hidden="true" />
              <h4>Vendor confirmation recorded.</h4>
              <p role="status">
                Only in this example. No real transfer was verified and no money was collected.
              </p>
            </div>
            <button ref={receiptAction} type="button" className={styles.action} onClick={onReceipt}>
              View sample receipt <ArrowRight size={15} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <DemoFoot
        onReset={() => {
          setClaim(false);
          setVerified(false);
          onReset();
        }}
      >
        Customer payments go to the vendor. Paystack is for Invend subscriptions.
      </DemoFoot>
    </div>
  );
}

function ReceiptPreview({ confirmed, onPayment }: { confirmed: boolean; onPayment: () => void }) {
  return (
    <div className={styles.receiptPreview} data-testid="tour-receipt">
      {!confirmed ? (
        <div className={styles.receiptLocked}>
          <span className={styles.lockedIcon}>
            <ReceiptText size={44} strokeWidth={1} aria-hidden="true" />
            <LockKeyhole size={18} aria-hidden="true" />
          </span>
          <h4>
            A receipt follows confirmation.
            <br />
            Not the other way around.
          </h4>
          <p>
            This sample payment has not been confirmed. Review the payment step before a receipt can
            appear.
          </p>
          <button type="button" className={styles.action} onClick={onPayment}>
            Review sample payment <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className={styles.receiptSheet}>
          <div className={styles.receiptBrand}>
            <BrandIcon size={31} />
            <span>SAMPLE RECEIPT</span>
          </div>
          <h4>{sale.vendor}</h4>
          <p>
            {sale.orderId} · {sale.customer}
          </p>
          <div className={styles.receiptItem}>
            <span>2 × Everyday adire tote</span>
            <span>₦22,000</span>
          </div>
          <dl className={styles.totals}>
            <div>
              <dt>Delivery to Yaba</dt>
              <dd>₦1,500</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>₦23,500</dd>
            </div>
          </dl>
          <div className={styles.receiptSeal}>
            <CheckCheck size={18} aria-hidden="true" />
            <span>
              Vendor-confirmed in this demo
              <br />
              <small>Confirmed by Tola · fictional owner</small>
            </span>
          </div>
          <p className={styles.receiptWarning}>Illustrative record. Not proof of a real payment.</p>
        </div>
      )}
      <DemoFoot>
        Receipts preserve confirmed details. This page cannot issue or share a real receipt.
      </DemoFoot>
    </div>
  );
}

function InsightsPreview() {
  const [metric, setMetric] = useState<'orders' | 'conversations'>('orders');
  const values = metric === 'orders' ? [2, 3, 1, 4, 3] : [4, 5, 3, 6, 4];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <div className={styles.insightsPreview} data-testid="tour-insights">
      <div className={styles.insightsTop}>
        <div>
          <span className={styles.smallLabel}>FICTIONAL WORKING WEEK</span>
          <h4>
            {total} <span>{metric}</span>
          </h4>
        </div>
        <div className={styles.metricToggle} aria-label="Sample activity metric">
          <button
            type="button"
            aria-pressed={metric === 'orders'}
            onClick={() => setMetric('orders')}
          >
            Orders
          </button>
          <button
            type="button"
            aria-pressed={metric === 'conversations'}
            onClick={() => setMetric('conversations')}
          >
            Conversations
          </button>
        </div>
      </div>
      <div
        className={styles.chart}
        role="img"
        aria-label={`Fictional ${metric}: ${days.map((day, index) => `${day} ${values[index]}`).join(', ')}. Total ${total}. Not business performance.`}
      >
        {values.map((value, index) => (
          <div key={days[index]}>
            <strong>{value}</strong>
            <span style={{ height: `${value * 22}px` }} />
            <small>{days[index]}</small>
          </div>
        ))}
      </div>
      <div className={styles.insightsBottom}>
        <span>
          <BarChart3 size={15} aria-hidden="true" />
          Recorded activity, not a prediction.
        </span>
        <span>Sample data only</span>
      </div>
      <DemoFoot>
        Historical insights are partially implemented. Live-data and numerical acceptance are still
        pending.
      </DemoFoot>
    </div>
  );
}

function TeamPreview() {
  const [assignee, setAssignee] = useState('Tola');
  const [human, setHuman] = useState(false);
  const [notice, setNotice] = useState('Fictional team. No real assignment or permission changes.');
  const id = useId();
  return (
    <div className={styles.teamPreview} data-testid="tour-team">
      <div className={styles.teamPeople}>
        <div>
          <span className={styles.avatar}>T</span>
          <span>
            <strong>Tola</strong>
            <small>Owner · role protected</small>
          </span>
          <ShieldCheck size={16} aria-hidden="true" />
        </div>
        <div>
          <span className={styles.avatar}>B</span>
          <span>
            <strong>Bisi</strong>
            <small>Sales agent · sample</small>
          </span>
          <Users size={16} aria-hidden="true" />
        </div>
      </div>
      <div className={styles.teamBody}>
        <label htmlFor={id}>Assign Amaka’s sample conversation</label>
        <select
          id={id}
          value={assignee}
          onChange={(event) => {
            setAssignee(event.target.value);
            setNotice(`Assigned to ${event.target.value} in this demo. No account was changed.`);
          }}
        >
          <option value="Tola">Tola · owner</option>
          <option value="Bisi">Bisi · sales agent</option>
        </select>
        <div className={styles.takeoverState}>
          <span>{human ? <Hand size={22} aria-hidden="true" /> : <BrandIcon size={26} />}</span>
          <div>
            <strong>
              {human ? 'Assistant replies paused' : 'Routine assistance, within your rules'}
            </strong>
            <p>
              {human
                ? 'You’re handling this sample conversation.'
                : 'Exceptions still need an owner decision.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.action}
          aria-pressed={human}
          onClick={() => {
            setHuman(!human);
            setNotice(
              human
                ? 'Handed back in the demo. Rule-bound assistance can resume.'
                : 'Taken over in the demo. Assistant replies are paused.',
            );
          }}
        >
          {human ? 'Hand back to assistant' : 'Take over sample conversation'}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
        <p role="status" className={styles.teamNotice}>
          {notice}
        </p>
      </div>
      <DemoFoot>
        Assignment does not transfer owner authority. Live invitations and role acceptance remain
        incomplete.
      </DemoFoot>
    </div>
  );
}

export function FeatureTour() {
  const [active, setActive] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    let frame = 0;
    const selectLinkedFeature = () => {
      const hash = window.location.hash.slice(1);
      const panelMatch = /^feature-panel-([0-7])$/.exec(hash);
      const index = legacyFeatures[hash] ?? (panelMatch ? Number(panelMatch[1]) : undefined);
      if (index === undefined) return;
      setActive(index);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Existing panel IDs are navigation destinations; their scroll margin clears the
        // floating header even if native hash scrolling happens before this selection effect.
        const target = document.getElementById(hash);
        target?.scrollIntoView({ block: 'start', behavior: 'instant' });
        if (panelMatch) target?.focus({ preventScroll: true });
      });
    };
    selectLinkedFeature();
    window.addEventListener('hashchange', selectLinkedFeature);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', selectLinkedFeature);
    };
  }, []);
  const goToFeature = (index: number) => {
    setActive(index);
    if (window.matchMedia('(max-width: 899px)').matches)
      mobileSelect.current?.focus({ preventScroll: true });
    else tabs.current[index]?.focus({ preventScroll: true });
  };
  const previews = [
    <InboxPreview key="inbox" />,
    <AssistancePreview key="assistance" />,
    <CataloguePreview key="catalogue" />,
    <OrderPreview key="orders" onPayment={() => goToFeature(4)} />,
    <PaymentPreview
      key="payments"
      confirmed={paymentConfirmed}
      onConfirm={() => setPaymentConfirmed(true)}
      onReceipt={() => goToFeature(5)}
      onReset={() => setPaymentConfirmed(false)}
    />,
    <ReceiptPreview key="receipts" confirmed={paymentConfirmed} onPayment={() => goToFeature(4)} />,
    <InsightsPreview key="insights" />,
    <TeamPreview key="team" />,
  ];
  return (
    <div className={styles.tour} data-testid="feature-tour">
      {Object.keys(legacyFeatures).map((id) => (
        <span key={id} id={id} className={styles.legacyAnchor} aria-hidden="true" />
      ))}
      <div className={styles.featureNav}>
        <p className={styles.navLabel}>
          EXPLORE THE WORKSPACE <span>01—08</span>
        </p>
        <div
          role="tablist"
          aria-label="Product features"
          aria-orientation="vertical"
          className={styles.tabs}
        >
          {features.map((feature, index) => (
            <button
              type="button"
              key={feature.name}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              role="tab"
              id={`feature-tab-${index}`}
              aria-controls={`feature-panel-${index}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                let next: number;
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
                  next = (index + 1) % features.length;
                else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
                  next = (index + features.length - 1) % features.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = features.length - 1;
                else return;
                event.preventDefault();
                setActive(next);
                tabs.current[next]?.focus({ preventScroll: true });
              }}
            >
              <feature.icon size={18} strokeWidth={1.5} aria-hidden="true" />
              <span>{feature.name}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={styles.mobilePicker}>
          <label htmlFor="mobile-feature-picker">
            Choose a feature <span>{String(active + 1).padStart(2, '0')} / 08</span>
          </label>
          <select
            ref={mobileSelect}
            id="mobile-feature-picker"
            value={active}
            onChange={(event) => setActive(Number(event.target.value))}
          >
            {features.map((feature, index) => (
              <option value={index} key={feature.name}>
                {feature.name}
              </option>
            ))}
          </select>
        </div>
        <p className={styles.tourDisclaimer}>
          <ShieldCheck size={16} aria-hidden="true" />
          Fictional examples.
          <br />
          Nothing is sent or saved.
        </p>
      </div>
      <div className={styles.previewArea}>
        {features.map((feature, index) => (
          <div
            key={feature.name}
            role="tabpanel"
            id={`feature-panel-${index}`}
            aria-labelledby={`feature-tab-${index}`}
            hidden={active !== index}
            tabIndex={0}
            className={styles.panel}
          >
            <div className={styles.panelHead}>
              <span className={styles.panelIndex}>
                0{index + 1} <span>/ 08</span>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <div className={styles.preview}>{previews[index]}</div>
            <p className={styles.readiness}>
              <span />
              {feature.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
