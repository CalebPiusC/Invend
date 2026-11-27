import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Mail,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import { sampleSale, sampleMoney } from './demo-data';
import styles from './workspace-preview.module.css';

const conversations = [
  {
    name: 'Amaka Bello',
    initials: 'AB',
    channel: 'Gmail',
    note: 'Two adire totes · price request',
    next: 'Review counter-offer',
    href: '#negotiation',
    review: true,
  },
  {
    name: 'Lola Adeyemi',
    initials: 'LA',
    channel: 'WhatsApp',
    note: 'Product details · indigo & cream',
    next: 'Check catalogue',
    href: '#smart-catalogue',
    review: false,
  },
  {
    name: 'Chidi Okafor',
    initials: 'CO',
    channel: 'Instagram',
    note: 'Delivery to Yaba · follow-up',
    next: 'Review next step',
    href: '#lead-management',
    review: false,
  },
] as const;

export function WorkspacePreview() {
  return (
    <div className={styles.layout} data-testid="workspace-preview">
      <figure
        className={styles.workspace}
        aria-label="Illustrative sales workspace, not live business data"
      >
        <div className={styles.topbar}>
          <span className={styles.miniBrand}>
            <BrandIcon size={22} /> invend
          </span>
          <span className={styles.breadcrumb}>
            {sampleSale.vendor} <span>/</span> Overview
          </span>
          <span className={styles.demoBadge}>Illustrative workspace</span>
        </div>
        <div className={styles.inner}>
          <dl className={styles.metrics}>
            <div>
              <dt>Needs your review</dt>
              <dd>
                {String(conversations.filter((c) => c.review).length).padStart(2, '0')}
                <span>Price approval, not autopilot</span>
              </dd>
            </div>
            <div>
              <dt>Sample draft orders</dt>
              <dd>
                01<span>Awaiting owner review</span>
              </dd>
            </div>
            <div>
              <dt>Available tote stock</dt>
              <dd>
                {sampleSale.stock}
                <span>Vendor-confirmed sample facts</span>
              </dd>
            </div>
          </dl>
          <div className={styles.listHead}>
            <h3>Conversations with a next step</h3>
            <a href="#unified-inbox">
              Try the inbox <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </div>
          <ul className={styles.conversations}>
            {conversations.map((conversation) => (
              <li key={conversation.name}>
                <a href={conversation.href}>
                  <span className={styles.avatar} aria-hidden="true">
                    {conversation.initials}
                  </span>
                  <span className={styles.person}>
                    <strong>{conversation.name}</strong>
                    <span>{conversation.note}</span>
                  </span>
                  <span className={styles.channel}>
                    {conversation.channel === 'Gmail' ? (
                      <Mail size={12} aria-hidden="true" />
                    ) : conversation.channel === 'Instagram' ? (
                      <Instagram size={12} aria-hidden="true" />
                    ) : (
                      <MessageCircle size={12} aria-hidden="true" />
                    )}
                    {conversation.channel}
                  </span>
                  <span className={`${styles.next} ${conversation.review ? styles.review : ''}`}>
                    {conversation.next}
                    <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <figcaption>
          Fictional people and counts. Channels are illustrative, including planned Instagram. No
          live connections.
        </figcaption>
      </figure>
      <aside className={styles.control} aria-label="Owner approval example">
        <ShieldCheck size={28} strokeWidth={1.4} aria-hidden="true" />
        <h3>
          AI that knows
          <br />
          when to ask.
        </h3>
        <p>Set your rules. Review exceptions. Approve the moments that matter.</p>
        <div className={styles.rule}>
          <span>TOLA’S PRICE BOUNDARY</span>
          <strong>{sampleMoney(sampleSale.minimumUnitPriceKobo)} minimum per tote.</strong>
          <p>An offer below it needs your review. It never changes the rule.</p>
        </div>
        <a href="#team-management">
          You stay in the driver’s seat. <ArrowRight size={14} aria-hidden="true" />
        </a>
      </aside>
    </div>
  );
}
