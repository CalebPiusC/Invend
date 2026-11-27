import { Check, FileText, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { sampleSale as sale, sampleMoney as money } from './demo-data';
import type { NavigationFeatureKey } from './feature-navigation';
import styles from './home-header.module.css';

const total = sale.minimumUnitPriceKobo * sale.quantity + sale.deliveryFeeKobo;

/** Compact, read-only excerpts of the existing tour. Not screenshots or live account data. */
export function NavigationPreview({ feature }: { feature: NavigationFeatureKey }) {
  if (feature === 'inbox')
    return (
      <div className={styles.snapshot}>
        <div className={styles.snapshotBar}>
          <Mail size={14} /> Customer conversation
        </div>
        <div className={styles.snapshotBody}>
          <div className={styles.person}>
            <span>AB</span>
            <div>
              <strong>{sale.customer}</strong>
              <small>Gmail · fictional conversation</small>
            </div>
          </div>
          <p className={styles.chatBubble}>“Can you do the two totes for ₦20,000?”</p>
          <div className={styles.contextNote}>
            <ShieldCheck size={15} />
            <span>
              Below your minimum.
              <br />
              <strong>Over to you.</strong>
            </span>
          </div>
        </div>
      </div>
    );
  if (feature === 'assistance')
    return (
      <div className={styles.snapshot}>
        <div className={styles.snapshotBar}>
          <ShieldCheck size={14} /> Owner review
        </div>
        <div className={styles.snapshotBody}>
          <span className={styles.previewEyebrow}>YOUR MINIMUM FOR TWO</span>
          <strong className={styles.previewAmount}>
            {money(sale.minimumUnitPriceKobo * sale.quantity)}
          </strong>
          <p className={styles.previewMuted}>The customer offered ₦20,000.</p>
          <div className={styles.previewRule}>
            No automatic promise.
            <br />
            <strong>Your approval comes first.</strong>
          </div>
          <span className={styles.previewTag}>Proposed reply · not sent</span>
        </div>
      </div>
    );
  if (feature === 'catalogue')
    return (
      <div className={styles.snapshot}>
        <div className={styles.snapshotBar}>
          Photo-first review <span>Prototype</span>
        </div>
        <div className={styles.snapshotBody}>
          <div className={styles.productRow}>
            <img
              src="/images/adire-tote-indigo.webp"
              width="68"
              height="82"
              loading="lazy"
              alt=""
            />
            <div>
              <strong>{sale.product}</strong>
              <small>{sale.variant}</small>
              <span>{money(sale.unitPriceKobo)}</span>
            </div>
          </div>
          <p className={styles.previewMuted}>AI-generated sample photo</p>
          <div className={styles.reviewLine}>
            <span className={styles.emptyCheck} /> Vendor review required
          </div>
          <p className={styles.previewMuted}>Name, variant, price and stock.</p>
        </div>
      </div>
    );
  if (feature === 'orders')
    return (
      <div className={styles.snapshot}>
        <div className={styles.snapshotBar}>
          Order draft <span>Sample</span>
        </div>
        <div className={styles.snapshotBody}>
          <span className={styles.previewEyebrow}>{sale.orderId}</span>
          <strong className={styles.previewCustomer}>{sale.customer}</strong>
          <p className={styles.previewMuted}>2 × {sale.product}</p>
          <div className={styles.previewTotals}>
            <span>Items + delivery</span>
            <strong>{money(total)}</strong>
          </div>
          <div className={styles.previewTag}>
            <LockKeyhole size={12} /> Payment not confirmed
          </div>
        </div>
      </div>
    );
  if (feature === 'payments')
    return (
      <div className={styles.snapshot}>
        <div className={styles.snapshotBar}>
          Payment record <span>Sample</span>
        </div>
        <div className={styles.snapshotBody}>
          <strong className={styles.previewAmount}>{money(total)}</strong>
          <p className={styles.previewMuted}>
            {sale.customer} · {sale.orderId}
          </p>
          <div className={styles.claimRow}>
            <FileText size={17} />
            <span>
              Screenshot received<small>Not a confirmation</small>
            </span>
          </div>
          <div className={styles.reviewLine}>
            <span className={styles.emptyCheck} /> Vendor confirmation required
          </div>
        </div>
      </div>
    );
  if (feature === 'receipts')
    return (
      <div className={`${styles.snapshot} ${styles.receiptSnapshot}`}>
        <div className={styles.snapshotBar}>
          Digital receipt <span>Sample</span>
        </div>
        <div className={styles.snapshotBody}>
          <span className={styles.receiptIcon}>
            <FileText size={34} strokeWidth={1.3} />
            <LockKeyhole size={15} />
          </span>
          <strong>
            Confirmation first.
            <br />
            Receipt second.
          </strong>
          <p className={styles.previewMuted}>
            This example stays locked until the vendor confirms payment.
          </p>
        </div>
      </div>
    );
  if (feature === 'insights')
    return (
      <div className={styles.snapshot}>
        <div className={styles.snapshotBar}>
          Business insights <span>In development</span>
        </div>
        <div className={styles.snapshotBody}>
          <span className={styles.previewEyebrow}>RECORDED ACTIVITY</span>
          <div className={styles.insightRow}>
            <span>Orders</span>
            <span>Historical view</span>
          </div>
          <div className={styles.insightRow}>
            <span>Conversations</span>
            <span>Historical view</span>
          </div>
          <p className={styles.previewMuted}>
            A view of past activity—not a prediction. Live-data validation is pending.
          </p>
        </div>
      </div>
    );
  return (
    <div className={styles.snapshot}>
      <div className={styles.snapshotBar}>
        Team workspace <span>Sample</span>
      </div>
      <div className={styles.snapshotBody}>
        <div className={styles.person}>
          <span>T</span>
          <div>
            <strong>{sale.owner}</strong>
            <small>Owner · authority protected</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <div className={styles.person}>
          <span>B</span>
          <div>
            <strong>Bisi</strong>
            <small>Sales agent · sample role</small>
          </div>
        </div>
        <div className={styles.contextNote}>
          <Check size={15} />
          <span>
            Assignments stay clear.
            <br />
            Decisions stay accountable.
          </span>
        </div>
      </div>
    </div>
  );
}
