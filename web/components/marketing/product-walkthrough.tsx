'use client';
import { useId, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCheck,
  Camera,
  ChevronRight,
  FileText,
  Hand,
  LockKeyhole,
  MessageCircle,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { sampleSale as sale, sampleMoney as money, checkSampleOffer } from './demo-data';
import styles from './product-demos.module.css';
import { BrandIcon } from '../brand-icon';

function DemoLabel() {
  return <span className={styles.demoLabel}>Interactive demo</span>;
}
function Reset({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.reset} onClick={onClick}>
      <RotateCcw size={13} aria-hidden="true" /> Reset demo
    </button>
  );
}
function Mark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <BrandIcon size={25} />
    </span>
  );
}

export function NegotiationDemo() {
  const [offer, setOffer] = useState(2_000_000);
  const [reviewed, setReviewed] = useState(false);
  const result = checkSampleOffer(offer);
  return (
    <div className={styles.negotiation} data-testid="negotiation-demo">
      <div className={styles.windowBar}>
        <span>
          <MessageCircle size={15} aria-hidden="true" /> Amaka’s conversation{' '}
          <span className={styles.barDivider}>/</span> {sale.vendor}
        </span>
        <DemoLabel />
      </div>
      <div className={styles.negotiationBody}>
        <div className={styles.exchange}>
          <p className={styles.fieldLabel}>CHOOSE A CUSTOMER’S OFFER FOR TWO TOTES</p>
          <div className={styles.offerChoices} aria-label="Sample customer offers">
            {[2_000_000, 2_200_000, 2_400_000].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={offer === value}
                onClick={() => {
                  setOffer(value);
                  setReviewed(false);
                }}
              >
                {money(value)}
              </button>
            ))}
          </div>
          <div className={styles.customerLine}>
            <span className={styles.avatar} aria-hidden="true">
              A
            </span>
            <div>
              <span className={styles.speaker}>Amaka · customer</span>
              <p>“Can I get the two totes for {money(offer)}?”</p>
            </div>
          </div>
          <div className={styles.assistantLine}>
            <Mark />
            <div>
              <span className={styles.speaker}>Invend · rule-checked example</span>
              <p>
                {result.needsApproval
                  ? 'That offer is below the minimum you set. This needs your review before anything is promised.'
                  : `That offer respects your minimum. The sample item total is ${money(offer)}; delivery is separate.`}
              </p>
            </div>
          </div>
          <div className={styles.suggestedReply}>
            <span className={styles.fieldLabel}>
              {result.needsApproval
                ? 'PROPOSED COUNTER-OFFER · FOR OWNER REVIEW'
                : 'SAMPLE REPLY · INSIDE YOUR RULE'}
            </span>
            <p>
              “
              {result.needsApproval
                ? 'I can offer the two totes for ₦22,000. Delivery to Yaba is ₦1,500. Would you like me to confirm the details?'
                : `Yes, the two totes would be ${money(offer)}. Delivery to Yaba is ₦1,500. Shall we confirm the details?`}
              ”
            </p>
          </div>
        </div>
        <aside className={styles.ruleSheet} aria-label="Vendor pricing rules">
          <p className={styles.fieldLabel}>
            <LockKeyhole size={13} aria-hidden="true" /> THE RULE DOESN’T MOVE
          </p>
          <dl>
            <div>
              <dt>Listed price, each</dt>
              <dd>{money(sale.unitPriceKobo)}</dd>
            </div>
            <div>
              <dt>Your minimum, each</dt>
              <dd>{money(sale.minimumUnitPriceKobo)}</dd>
            </div>
            <div>
              <dt>Quantity requested</dt>
              <dd>{sale.quantity}</dd>
            </div>
          </dl>
          <div className={styles.minimum}>
            <span>Minimum item total</span>
            <strong>{money(result.minimumKobo)}</strong>
            <small>2 × ₦11,000. A rule, not an AI estimate.</small>
          </div>
          <div className={`${styles.ruleResult} ${result.needsApproval ? styles.needsReview : ''}`}>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>
              <strong>
                {result.needsApproval ? 'Owner review required' : 'Within the price boundary'}
              </strong>
              <span>
                {result.needsApproval
                  ? `${money(result.shortfallKobo)} below your minimum.`
                  : 'No below-floor promise.'}
              </span>
            </span>
          </div>
          <button
            type="button"
            className={styles.action}
            disabled={reviewed}
            onClick={() => setReviewed(true)}
          >
            {reviewed ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <CheckCheck size={16} aria-hidden="true" />
            )}
            {reviewed
              ? 'Reviewed in this demo'
              : result.needsApproval
                ? 'Approve sample counter-offer'
                : 'Try the rule-checked reply'}
          </button>
        </aside>
      </div>
      <div className={styles.demoFooter}>
        <p role="status">
          {reviewed
            ? 'Sample reply reviewed. No message was sent and no order was changed.'
            : 'Fictional prices and conversation. Nothing here sends a message or changes a real price.'}
        </p>
        <Reset
          onClick={() => {
            setOffer(2_000_000);
            setReviewed(false);
          }}
        />
      </div>
    </div>
  );
}

export function CatalogueDemo() {
  const [step, setStep] = useState(0);
  const [stock, setStock] = useState<number>(sale.stock);
  const [checked, setChecked] = useState(false);
  const reset = () => {
    setStep(0);
    setStock(sale.stock);
    setChecked(false);
  };
  return (
    <div className={styles.catalogue} data-testid="catalogue-demo">
      <div className={styles.cataloguePhoto}>
        <span className={styles.photoLabel}>
          <Camera size={13} aria-hidden="true" /> SAMPLE PHOTO / 01
        </span>
        <img
          src="/images/adire-tote-indigo.webp"
          alt="AI-generated sample product photo of an indigo and cream adire tote"
          width="640"
          height="640"
          loading="lazy"
        />
        <div className={styles.photoVoice}>
          <MessageCircle size={16} aria-hidden="true" />
          <p>
            “This tote is ₦12,000.
            <br />I have 12 in stock.”<span>Fictional vendor-supplied details</span>
          </p>
        </div>
      </div>
      <div className={styles.cataloguePaper}>
        <div className={styles.paperTop}>
          <span>
            {step === 2
              ? '03 / CONFIRMED'
              : step === 1
                ? '02 / REVIEW THE DETAILS'
                : '01 / START WITH A PHOTO'}
          </span>
          <DemoLabel />
        </div>
        {step === 0 ? (
          <>
            <span className={styles.largePhotoIcon}>
              <Camera size={30} aria-hidden="true" />
            </span>
            <h3>
              Less typing.
              <br />
              More checking.
            </h3>
            <p className={styles.paperDescription}>
              A photo starts the draft. You supply prices and stock, then check every detail before
              confirming.
            </p>
            <button type="button" className={styles.action} onClick={() => setStep(1)}>
              Review sample details <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <span className={styles.fieldLabel}>
              {step === 2
                ? 'CONFIRMED ONLY IN THIS DEMO'
                : 'ILLUSTRATIVE DRAFT · NOT LIVE EXTRACTION'}
            </span>
            <h3>{sale.product}</h3>
            <dl className={styles.catalogueFacts}>
              <div>
                <dt>Variant</dt>
                <dd>{sale.variant} · cotton</dd>
              </div>
              <div>
                <dt>Vendor’s price</dt>
                <dd>{money(sale.unitPriceKobo)}</dd>
              </div>
            </dl>
            <div className={styles.stockReview}>
              <span>Pieces available</span>
              <div>
                <button
                  type="button"
                  aria-label="Decrease sample stock"
                  disabled={stock === 0 || step === 2}
                  onClick={() => setStock(Math.max(0, stock - 1))}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <output aria-label="Sample stock count">{stock}</output>
                <button
                  type="button"
                  aria-label="Increase sample stock"
                  disabled={stock === 99 || step === 2}
                  onClick={() => setStock(Math.min(99, stock + 1))}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
            {step === 1 && (
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => setChecked(event.target.checked)}
                />
                I’ve checked these sample details.
              </label>
            )}
            <button
              type="button"
              className={styles.action}
              disabled={!checked || step === 2}
              onClick={() => setStep(2)}
            >
              {step === 2 ? <Check size={16} aria-hidden="true" /> : null}
              {step === 2 ? 'Confirmed in the demo' : 'Confirm sample product'}
            </button>
          </>
        )}
        <p className={styles.catalogueStatus} role="status">
          {step === 2
            ? 'Sample confirmed. No product or photo was saved to a business account.'
            : 'Live photo extraction is in development. This is an interactive illustration.'}
        </p>
        <Reset onClick={reset} />
      </div>
    </div>
  );
}

const conversations = [
  {
    name: 'Amaka Bello',
    initial: 'A',
    channel: 'Gmail / Email',
    preview: 'Can I get two for ₦20,000?',
    question: 'Can I get two for ₦20,000? They’re gifts for my sisters.',
    reply: 'This needs owner review. The two totes have a ₦22,000 minimum before delivery.',
    stage: 'Interested',
    context: 'Two gifts · indigo & cream · Yaba',
  },
  {
    name: 'Chidi Okafor',
    initial: 'C',
    channel: 'Instagram',
    preview: 'Do you deliver to Yaba?',
    question: 'I saw the adire tote. Do you deliver to Yaba?',
    reply: 'The sample vendor’s Yaba delivery fee is ₦1,500, with a 2–3 working day window.',
    stage: 'New enquiry',
    context: 'Asked about delivery · Yaba',
  },
  {
    name: 'Lola Adeyemi',
    initial: 'L',
    channel: 'WhatsApp',
    preview: 'Is the cream and indigo one in stock?',
    question: 'Is the cream and indigo tote in stock? I’d like one.',
    reply:
      'The sample catalogue lists 12 pieces of the indigo and cream cotton tote at ₦12,000 each.',
    stage: 'Interested',
    context: 'One tote · indigo & cream',
  },
] as const;

export function InboxDemo() {
  const [selected, setSelected] = useState(0);
  const customer = conversations[selected];
  return (
    <div className={styles.inbox} data-testid="inbox-demo">
      <div className={styles.windowBar}>
        <span>
          <Mark />
          <strong>Inbox</strong>
          <span className={styles.barDivider}>/</span>
          {sale.vendor}
        </span>
        <DemoLabel />
      </div>
      <div className={styles.inboxColumns}>
        <div className={styles.conversationList} aria-label="Sample conversations">
          <p className={styles.listHeading}>CUSTOMER CONVERSATIONS</p>
          {conversations.map((conversation, index) => (
            <button
              type="button"
              key={conversation.name}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span className={styles.avatar} aria-hidden="true">
                {conversation.initial}
              </span>
              <span>
                <strong>{conversation.name}</strong>
                <span className={styles.channelName}>{conversation.channel} · sample</span>
                <span className={styles.preview}>{conversation.preview}</span>
              </span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={styles.chatPanel}>
          <div className={styles.chatTitle}>
            <div>
              <strong>{customer.name}</strong>
              <span>{customer.channel} · fictional conversation</span>
            </div>
            <span className={styles.stagePill}>{customer.stage}</span>
          </div>
          <p className={styles.chatCustomer}>{customer.question}</p>
          <div className={styles.chatReply}>
            <span>
              <Mark /> Invend · sample response
            </span>
            <p>{customer.reply}</p>
            <CheckCheck size={15} aria-hidden="true" />
          </div>
          <div className={styles.chatComposer}>
            <span>Review the next step in the workspace</span>
            <a href="/app" aria-label="Explore the sample inbox">
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <aside className={styles.customerContext}>
          <p className={styles.fieldLabel}>CONTEXT, NOT GUESSWORK</p>
          <img
            src="/images/adire-tote-indigo.webp"
            alt=""
            width="100"
            height="100"
            loading="lazy"
          />
          <strong>{sale.product}</strong>
          <p>{customer.context}</p>
          <dl>
            <div>
              <dt>Listed price</dt>
              <dd>{money(sale.unitPriceKobo)}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>12 pieces</dd>
            </div>
            <div>
              <dt>Assigned to</dt>
              <dd>Tola · owner</dd>
            </div>
          </dl>
        </aside>
      </div>
      <div className={styles.demoFooter}>
        <p>
          Illustrative channel conversations, including a planned integration. No accounts are
          connected by this demonstration.
        </p>
        <span className={styles.viewLabel}>SELECT A CONVERSATION</span>
      </div>
    </div>
  );
}

const leadStages = ['Enquiry', 'Interested', 'Ready to buy', 'Purchased'] as const;
const leadNotes = [
  [
    'A product question worth remembering.',
    'Amaka asked about the indigo adire tote. Keep the product and her delivery area with the conversation.',
  ],
  [
    'There’s interest. And an open question.',
    'She wants two gifts and asked for a better price. The next step is reviewing the counter-offer, not a generic sales message.',
  ],
  [
    'The details are agreed. Confirm the next step.',
    'The sample item total is ₦22,000, plus ₦1,500 delivery. Review the order before asking the customer to pay the vendor.',
  ],
  [
    'A purchase is part of a relationship.',
    'Once the vendor has confirmed payment, keep the order and preferences with the customer context.',
  ],
] as const;
export function LeadDemo() {
  const [stage, setStage] = useState(1);
  const [consent, setConsent] = useState(false);
  const [queued, setQueued] = useState(false);
  return (
    <div className={styles.leads} data-testid="lead-demo">
      <div className={styles.leadProgress} aria-label="Sample lead stages">
        {leadStages.map((label, index) => (
          <button
            type="button"
            key={label}
            aria-pressed={stage === index}
            onClick={() => {
              setStage(index);
              setQueued(false);
            }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{label}</strong>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className={styles.leadBody}>
        <div className={styles.leadContext}>
          <div className={styles.leadPerson}>
            <span className={styles.avatar} aria-hidden="true">
              A
            </span>
            <div>
              <strong>Amaka Bello</strong>
              <span>Yaba, Lagos · fictional customer</span>
            </div>
            <DemoLabel />
          </div>
          <h3>{leadNotes[stage][0]}</h3>
          <p>{leadNotes[stage][1]}</p>
          <div className={styles.contextTags}>
            <span>2 adire totes</span>
            <span>Gifts for her sisters</span>
            <span>Price-sensitive</span>
          </div>
        </div>
        <div className={styles.followup}>
          <p className={styles.fieldLabel}>A FOLLOW-UP WITH CONTEXT</p>
          <blockquote>
            “Hi Amaka, would you like to continue with the two indigo totes we discussed? I can
            confirm current availability for you.”
          </blockquote>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setQueued(false);
              }}
            />
            Customer consent noted in this example.
          </label>
          <button
            type="button"
            className={styles.action}
            disabled={!consent || queued}
            onClick={() => setQueued(true)}
          >
            {queued ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Send size={15} aria-hidden="true" />
            )}
            {queued ? 'Queued in this demo' : 'Queue sample follow-up'}
          </button>
          <p role="status" className={styles.smallNote}>
            {queued
              ? 'Sample follow-up queued. No message will be sent.'
              : 'Illustrative scheduling only. Consent and current business facts still matter.'}
          </p>
        </div>
      </div>
      <div className={styles.demoFooter}>
        <p>
          Stages are selected manually in this example. Automatic live lead qualification is still
          in development.
        </p>
        <Reset
          onClick={() => {
            setStage(1);
            setConsent(false);
            setQueued(false);
          }}
        />
      </div>
    </div>
  );
}

export function OrderJourney() {
  const [step, setStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [screenshot, setScreenshot] = useState(false);
  const subtotal = sale.quantity * sale.minimumUnitPriceKobo;
  const total = subtotal + sale.deliveryFeeKobo;
  return (
    <div className={styles.orderJourney} data-testid="order-demo">
      <div className={styles.windowBar}>
        <span>
          <Package size={16} aria-hidden="true" /> One conversation. One traceable order.
        </span>
        <DemoLabel />
      </div>
      <ol className={styles.orderSteps} aria-label="Sample order progress">
        {['Enquiry', 'Order draft', 'Confirm payment', 'Receipt'].map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? 'step' : undefined}
            className={step > index ? styles.stepDone : ''}
          >
            <span>{step > index ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className={styles.orderBody}>
        <div className={styles.orderExplanation}>
          <p className={styles.fieldLabel}>
            {
              [
                'START WITH THE AGREED DETAILS',
                'REVIEW BEFORE CONFIRMING',
                'THE VENDOR VERIFIES THE PAYMENT',
                'A RECORD, NOT A PAYMENT GUESS',
              ][step]
            }
          </p>
          <h3>
            {
              [
                '“Yes, I’ll take the two.”',
                'An order you can check.',
                'A screenshot is not confirmation.',
                'The details don’t disappear into chat.',
              ][step]
            }
          </h3>
          <p>
            {
              [
                'Amaka has accepted the sample ₦22,000 counter-offer. She wants delivery to Yaba. Bring those facts into a draft for review.',
                'Check the items, customer, delivery and agreed amount. This is a sample order, not an automatic commitment to fulfil.',
                'Your customer pays you directly. Check your account or a verified integration before recording payment. Invend does not independently verify a bank transfer.',
                'The sample receipt records the agreed items and the vendor’s confirmation. A real receipt should preserve the confirmed record; this demonstration is not proof of payment.',
              ][step]
            }
          </p>
          {step === 0 && (
            <button type="button" className={styles.action} onClick={() => setStep(1)}>
              Create sample draft <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
          {step === 1 && (
            <button type="button" className={styles.action} onClick={() => setStep(2)}>
              Review payment step <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
          {step === 2 && (
            <div className={styles.paymentControls}>
              <button
                type="button"
                className={styles.screenshotButton}
                onClick={() => setScreenshot(true)}
              >
                <FileText size={15} aria-hidden="true" />
                Test a payment screenshot
              </button>
              {screenshot && (
                <p role="status" className={styles.screenshotWarning}>
                  Screenshot received in the demo. Payment is still unconfirmed.
                </p>
              )}
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(event) => setVerified(event.target.checked)}
                />
                I have verified this sample payment as the vendor.
              </label>
              <button
                type="button"
                className={styles.action}
                disabled={!verified}
                onClick={() => {
                  if (verified) setStep(3);
                }}
              >
                Record sample confirmation <Check size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          {step === 3 && (
            <p className={styles.confirmedNote} role="status">
              <ShieldCheck size={18} aria-hidden="true" />
              Vendor confirmation recorded in this demo only.
            </p>
          )}
        </div>
        <div className={styles.orderPaper}>
          <div className={styles.receiptHeading}>
            <span>{step === 3 ? 'SAMPLE RECEIPT' : 'SAMPLE ORDER'}</span>
            <strong>{sale.vendor}</strong>
            <span>
              {sale.orderId} ·{' '}
              {step === 0
                ? 'agreed details'
                : step === 1
                  ? 'draft'
                  : step === 2
                    ? 'awaiting payment'
                    : 'vendor-confirmed example'}
            </span>
          </div>
          <div className={styles.orderCustomer}>
            <span>FOR</span>
            <strong>{sale.customer}</strong>
            <span>Yaba, Lagos · fictional address</span>
          </div>
          <div className={styles.receiptItem}>
            <img
              src="/images/adire-tote-indigo.webp"
              alt=""
              width="58"
              height="58"
              loading="lazy"
            />
            <div>
              <strong>{sale.product}</strong>
              <span>2 × {money(sale.minimumUnitPriceKobo)} · Indigo & cream</span>
            </div>
          </div>
          <dl className={styles.receiptTotals}>
            <div>
              <dt>Items</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Yaba delivery</dt>
              <dd>{money(sale.deliveryFeeKobo)}</dd>
            </div>
            <div className={styles.receiptTotal}>
              <dt>Total</dt>
              <dd>{money(total)}</dd>
            </div>
          </dl>
          <div className={`${styles.receiptStatus} ${step === 3 ? styles.receiptConfirmed : ''}`}>
            <ShieldCheck size={15} aria-hidden="true" />
            {step === 3 ? 'Vendor-confirmed · demo only' : 'Payment not confirmed'}
          </div>
          <p className={styles.receiptDisclaimer}>
            {step === 3
              ? 'Illustrative receipt. Not proof of a real payment.'
              : 'No payment link. No money collected by this demo.'}
          </p>
        </div>
      </div>
      <div className={styles.demoFooter}>
        <p>
          Customer payments go to the vendor. Paystack is for Invend subscriptions, not collecting
          customer payments.
        </p>
        <Reset
          onClick={() => {
            setStep(0);
            setVerified(false);
            setScreenshot(false);
          }}
        />
      </div>
    </div>
  );
}

export function HumanControlDemo() {
  const [human, setHuman] = useState(false);
  const [approved, setApproved] = useState(false);
  const [assignee, setAssignee] = useState('Tola');
  const [notice, setNotice] = useState('');
  const id = useId();
  return (
    <div className={styles.humanControl} data-testid="control-demo">
      <div className={styles.windowBar}>
        <span>
          <ShieldCheck size={16} aria-hidden="true" />
          The owner’s view
        </span>
        <DemoLabel />
      </div>
      <div className={styles.humanInner}>
        <div className={styles.controlState}>
          <span className={styles.controlIcon}>
            {human ? <Hand size={21} aria-hidden="true" /> : <Mark />}
          </span>
          <div>
            <strong>
              {human
                ? 'You’re handling this conversation'
                : 'The assistant is handling routine replies'}
            </strong>
            <p>
              {human
                ? 'AI replies are paused in this demonstration.'
                : 'Your boundaries still apply. Exceptions still need you.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.takeover}
          aria-pressed={human}
          onClick={() => {
            setHuman(!human);
            setNotice(
              human
                ? 'Handed back in the demo. Rule-bound assistant replies can resume.'
                : 'Taken over in the demo. Assistant replies are paused.',
            );
          }}
        >
          {human ? 'Hand back to assistant' : 'Take over demo conversation'}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <div className={styles.assignment}>
          <label htmlFor={id}>Assigned teammate</label>
          <select
            id={id}
            value={assignee}
            onChange={(event) => {
              setAssignee(event.target.value);
              setNotice(
                `Sample conversation assigned to ${event.target.value}. No account was changed.`,
              );
            }}
          >
            <option value="Tola">Tola · owner</option>
            <option value="Bisi">Bisi · sales team</option>
          </select>
        </div>
        <div className={styles.ownerApproval}>
          <span className={styles.fieldLabel}>
            {approved ? 'REVIEWED BY TOLA · OWNER' : 'NEEDS TOLA’S REVIEW'}
          </span>
          <p>
            Offer Amaka two totes for ₦22,000. The customer’s ₦20,000 request is below the approved
            minimum.
          </p>
          <button
            type="button"
            className={styles.approveLink}
            disabled={approved}
            onClick={() => {
              setApproved(true);
              setNotice('Tola approved the sample counter-offer. No message was sent.');
            }}
          >
            <CheckCheck size={16} aria-hidden="true" />
            {approved ? 'Sample reply approved' : 'Approve sample reply'}
          </button>
        </div>
        <div className={styles.accountability}>
          <UserRound size={15} aria-hidden="true" />
          <p>
            <strong>Clear responsibility.</strong> Assigned to {assignee}.{' '}
            {approved
              ? 'Counter-offer reviewed by Tola.'
              : 'Price exception awaiting owner review.'}
          </p>
        </div>
        <p role="status" className={styles.controlNotice}>
          {notice || 'Fictional team and actions. No real conversation is changed.'}
        </p>
        <Reset
          onClick={() => {
            setHuman(false);
            setApproved(false);
            setAssignee('Tola');
            setNotice('Demo reset. No real conversation was changed.');
          }}
        />
      </div>
    </div>
  );
}
