'use client';
import { useState } from 'react';
import { ArrowRight, Check, Mail, RotateCcw, ShieldCheck } from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import { sampleSale as sale, sampleMoney as money, checkSampleOffer } from './demo-data';
import styles from './signature-scene.module.css';

export function SignatureScene() {
  const [stage, setStage] = useState<'conversation' | 'draft' | 'review' | 'approved'>(
    'conversation',
  );
  const rule = checkSampleOffer(2_000_000);
  const total = rule.minimumKobo + sale.deliveryFeeKobo;
  const step = stage === 'conversation' ? 1 : stage === 'draft' ? 2 : 3;
  return (
    <figure
      className={styles.scene}
      aria-label="Illustrative enquiry-to-order workflow with owner approval"
      data-testid="hero-sales-demo"
    >
      <div className={styles.window}>
        <div className={styles.windowHead}>
          <span className={styles.mailIcon}>
            <Mail size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Amaka Bello</strong>
            <span>Gmail · fictional conversation</span>
          </div>
          <span className={styles.demoTag}>ILLUSTRATIVE DEMO</span>
        </div>
        <div className={styles.body}>
          {stage === 'conversation' ? (
            <>
              <p className={styles.time}>THE CONVERSATION STARTS HERE</p>
              <p className={styles.customer}>
                Hi! Do you have two indigo totes? I need them delivered to Yaba.
              </p>
              <div className={styles.assistant}>
                <div className={styles.assistantName}>
                  <BrandIcon size={19} />
                  <span>Invend · suggested reply</span>
                </div>
                <p>
                  Yes—the indigo & cream tote is in stock. Two are{' '}
                  {money(sale.unitPriceKobo * sale.quantity)}, plus {money(sale.deliveryFeeKobo)}{' '}
                  delivery. Shall we confirm the details?
                </p>
              </div>
              <div className={styles.product}>
                <img
                  src="/images/adire-tote-indigo.webp"
                  width="64"
                  height="64"
                  alt="AI-generated adire tote used in this fictional sales example"
                  fetchPriority="high"
                />
                <div>
                  <strong>2 × {sale.product}</strong>
                  <span>
                    {money(sale.unitPriceKobo)} each · {sale.stock} in stock
                  </span>
                  <small>From vendor-confirmed sample facts</small>
                </div>
              </div>
              <p className={styles.followup}>
                <span>Amaka</span> “Could you do two for ₦20,000?”
              </p>
            </>
          ) : (
            <>
              <div className={styles.draftHeading}>
                <span>PROPOSED ORDER</span>
                <strong>{sale.orderId}</strong>
                <span>{stage === 'approved' ? 'Counter-offer reviewed' : 'Not yet approved'}</span>
              </div>
              <div className={styles.draftProduct}>
                <img src="/images/adire-tote-indigo.webp" width="64" height="64" alt="" />
                <div>
                  <strong>2 × {sale.product}</strong>
                  <span>{sale.variant} · Amaka Bello</span>
                </div>
              </div>
              <dl className={styles.totals}>
                <div>
                  <dt>Customer’s offer</dt>
                  <dd>₦20,000</dd>
                </div>
                <div>
                  <dt>Minimum item total</dt>
                  <dd>{money(rule.minimumKobo)}</dd>
                </div>
                <div>
                  <dt>Delivery to Yaba</dt>
                  <dd>{money(sale.deliveryFeeKobo)}</dd>
                </div>
                <div>
                  <dt>Proposed total</dt>
                  <dd>{money(total)}</dd>
                </div>
              </dl>
              <div className={styles.owner}>
                <ShieldCheck size={17} aria-hidden="true" />
                <div>
                  <strong>
                    {stage === 'approved'
                      ? 'Reviewed by Tola · owner'
                      : 'Tola’s approval comes first'}
                  </strong>
                  <p>
                    {stage === 'approved'
                      ? `Tola reviewed the ${money(rule.minimumKobo)} counter-offer. The below-floor request was not accepted, and the price rule is unchanged.`
                      : `The original offer is below the ${money(rule.minimumKobo)} floor. Review this counter-offer before promising it to the customer.`}
                  </p>
                </div>
              </div>
              <p className={styles.unpaid}>Customer acceptance and payment are still pending.</p>
            </>
          )}
        </div>
        <div className={styles.decision}>
          <div>
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              <strong>
                {stage === 'approved'
                  ? 'Your decision. Clearly recorded.'
                  : stage === 'review'
                    ? 'A decision for the business owner.'
                    : 'Below your minimum. Not an automatic yes.'}
              </strong>
              <span>
                {stage === 'conversation'
                  ? 'A draft can be prepared. Nothing is promised or sent.'
                  : stage === 'draft'
                    ? 'A proposed order, not a confirmed sale.'
                    : stage === 'review'
                      ? 'Approve the ₦22,000 item total, plus delivery.'
                      : 'A reviewed counter-offer, not a payment confirmation.'}
              </span>
            </p>
          </div>
          {stage === 'approved' ? (
            <button type="button" onClick={() => setStage('conversation')}>
              <RotateCcw size={14} aria-hidden="true" /> Restart example
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setStage(
                  stage === 'conversation' ? 'draft' : stage === 'draft' ? 'review' : 'approved',
                )
              }
            >
              {stage === 'conversation'
                ? 'Build a sample draft'
                : stage === 'draft'
                  ? 'Review owner approval'
                  : 'Approve demo counter-offer'}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <ol className={styles.steps} aria-label="Illustrative sales workflow">
        {['Enquiry', 'Recommendation', 'Draft order', 'Owner approval'].map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? 'step' : undefined}
            data-complete={index < step || stage === 'approved'}
          >
            <span>
              {index < step || stage === 'approved' ? (
                <Check size={10} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <figcaption role="status">
        {stage === 'approved'
          ? 'Approved in this demo only. No message was sent or order saved.'
          : stage === 'review'
            ? 'Owner review: a ₦22,000 counter-offer plus delivery. Not approved or sent yet.'
            : stage === 'draft'
              ? 'Sample draft prepared: ₦23,500. Owner review is still required. Nothing sent or saved.'
              : 'Illustrative workflow · AI-generated product image. No live messages or orders.'}
      </figcaption>
    </figure>
  );
}
