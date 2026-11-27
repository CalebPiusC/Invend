import {
  ArrowUpRight,
  BarChart3,
  BatteryFull,
  Check,
  ChevronDown,
  ChevronLeft,
  Inbox,
  Mail,
  MoreHorizontal,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Wifi,
} from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import { sampleSale } from './demo-data';
import styles from './product-showcase.module.css';

const navigation = [
  { Icon: Inbox, name: 'Inbox' },
  { Icon: ShoppingBag, name: 'Orders' },
  { Icon: Package, name: 'Catalogue' },
  { Icon: BarChart3, name: 'Insights' },
  { Icon: Settings2, name: 'Settings' },
];

function Wordmark() {
  return (
    <span className={styles.wordmark}>
      <BrandIcon size={25} />
      <span>Invend</span>
    </span>
  );
}

export function ProductShowcase() {
  return (
    <figure
      id="workspace"
      tabIndex={-1}
      className={styles.showcase}
      data-testid="workspace-preview"
      aria-labelledby="workspace-title"
    >
      <h2 id="workspace-title" className={styles.srOnly}>
        Your workspace, at your desk and on the go.
      </h2>
      <div className={styles.stage}>
        <div
          className={styles.dashboard}
          data-testid="hero-dashboard"
          aria-label="Illustrative desktop workspace"
        >
          <div className={styles.windowBar}>
            <span className={styles.windowDots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              <ShieldCheck size={11} aria-hidden="true" /> Invend workspace
            </span>
            <span className={styles.demoLabel}>ILLUSTRATION</span>
          </div>
          <div className={styles.desktopApp}>
            <aside
              className={styles.sidebar}
              aria-label="Illustrative workspace navigation, not interactive"
            >
              <Wordmark />
              <div className={styles.business}>
                <span>T</span>
                <div>
                  {sampleSale.vendor}
                  <small>Fictional business</small>
                </div>
                <ChevronDown size={10} aria-hidden="true" />
              </div>
              <p className={styles.sideLabel}>YOUR WORKSPACE</p>
              {navigation.map(({ Icon, name }) => (
                <span
                  key={name}
                  className={`${styles.sideItem} ${name === 'Inbox' ? styles.sideActive : ''}`}
                >
                  <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                  {name}
                  {name === 'Inbox' && <i />}
                </span>
              ))}
              <div className={styles.sideFoot}>
                <span className={styles.ownerAvatar}>T</span>
                <div>
                  Tola<small>Business owner</small>
                </div>
              </div>
            </aside>
            <div className={styles.main}>
              <div className={styles.breadcrumb}>
                Workspace <span>/</span> Inbox{' '}
                <span className={styles.sampleTag}>Fictional data · no live connections</span>
              </div>
              <div className={styles.inboxHeading}>
                <div>
                  <h3>All your conversations.</h3>
                  <p>The context you need. The next step, clearer.</p>
                </div>
                <span className={styles.search}>
                  <Search size={14} aria-hidden="true" />
                </span>
              </div>
              <div className={styles.inboxTabs}>
                <span>All conversations</span>
                <span>
                  Needs you <b>1</b>
                </span>
                <span>Assigned to me</span>
              </div>
              <div className={styles.inboxLayout}>
                <div className={styles.chatList}>
                  <p className={styles.listLabel}>
                    INBOX <span>Sample conversations</span>
                  </p>
                  {[
                    [
                      'AB',
                      'Amaka Bello',
                      'Can you do two for ₦20,000?',
                      'Needs your review',
                      '10:24',
                    ],
                    [
                      'LA',
                      'Lola Adeyemi',
                      'Do you have the cream tote?',
                      'Product enquiry',
                      '10:18',
                    ],
                    [
                      'CO',
                      'Chidi Okafor',
                      'How much is delivery to Yaba?',
                      'Delivery enquiry',
                      '09:56',
                    ],
                  ].map(([initials, name, message, status, time], index) => (
                    <div className={index === 0 ? styles.selectedChat : styles.chat} key={name}>
                      <span className={styles.chatAvatar}>{initials}</span>
                      <div>
                        <strong>
                          {name}
                          <small>{time}</small>
                        </strong>
                        <span>{message}</span>
                        <em>{status}</em>
                      </div>
                    </div>
                  ))}
                  <p className={styles.listFoot}>
                    <Mail size={12} aria-hidden="true" /> Fictional email conversations
                  </p>
                </div>
                <div className={styles.thread}>
                  <div className={styles.threadHeader}>
                    <span className={styles.chatAvatar}>AB</span>
                    <div>
                      <strong>{sampleSale.customer}</strong>
                      <span>Gmail · sample conversation</span>
                    </div>
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </div>
                  <p className={styles.threadDate}>TODAY · FICTIONAL EXAMPLE</p>
                  <p className={styles.customerMessage}>
                    Hi! Can you do the two indigo totes for ₦20,000?
                  </p>
                  <div className={styles.approval}>
                    <div className={styles.approvalTitle}>
                      <ShieldCheck size={15} aria-hidden="true" />
                      <strong>This one needs you.</strong>
                      <span>OWNER REVIEW</span>
                    </div>
                    <p>The offer is below your ₦22,000 minimum for two.</p>
                    <span className={styles.proposedLabel}>PROPOSED REPLY · NOT SENT</span>
                    <blockquote>
                      “I can offer two for ₦22,000, plus ₦1,500 delivery to Yaba. Would you like to
                      go ahead?”
                    </blockquote>
                    <div
                      className={styles.reviewActions}
                      aria-label="Illustrated owner review actions, not interactive"
                    >
                      <span>
                        <Check size={11} aria-hidden="true" />
                        Approve reply
                      </span>
                      <span>Edit</span>
                      <span>Reject</span>
                    </div>
                  </div>
                  <div className={styles.orderContext}>
                    <Package size={15} aria-hidden="true" />
                    <div>
                      <strong>2 × Everyday adire tote</strong>
                      <span>Indigo & cream · Yaba, Lagos</span>
                    </div>
                    <span>Not an order yet</span>
                  </div>
                  <div className={styles.composer}>
                    <span>Your voice. Your decision.</span>
                    <BrandIcon size={17} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={styles.phone}
          data-testid="hero-phone"
          aria-label="Illustrative mobile Invend web app, not interactive"
        >
          <span className={styles.phoneSideKey} aria-hidden="true" />
          <div className={styles.phoneScreen}>
            <div className={styles.phoneStatus} aria-hidden="true">
              <span>9:41</span>
              <i />
              <span>
                <Wifi size={12} />
                <BatteryFull size={16} />
              </span>
            </div>
            <div className={styles.phoneTop}>
              <Wordmark />
              <span className={styles.phoneOwner}>T</span>
            </div>
            <div className={styles.phonePageTitle}>
              <ChevronLeft size={17} aria-hidden="true" />
              <span>Inbox</span>
              <em>ILLUSTRATION</em>
            </div>
            <div className={styles.phoneContent}>
              <div className={styles.phoneCustomer}>
                <span>AB</span>
                <div>
                  <strong>{sampleSale.customer}</strong>
                  <small>
                    <Mail size={10} aria-hidden="true" /> Gmail · sample conversation
                  </small>
                </div>
                <MoreHorizontal size={18} aria-hidden="true" />
              </div>
              <p className={styles.phoneMessage}>
                Hi! Can you do the two indigo totes for ₦20,000?
              </p>
              <div className={styles.phoneProduct}>
                <img
                  src="/images/adire-tote-indigo.webp"
                  width="45"
                  height="50"
                  alt="Illustrative indigo adire tote"
                  loading="eager"
                  decoding="async"
                />
                <div>
                  <strong>Everyday adire tote</strong>
                  <span>Indigo & cream · Qty 2</span>
                  <small>
                    Your minimum <b>₦22,000</b>
                  </small>
                </div>
              </div>
              <div className={styles.phoneReview}>
                <span className={styles.phoneReviewTitle}>
                  <ShieldCheck size={15} aria-hidden="true" /> Your decision comes first.
                </span>
                <p>This offer is below your minimum. Nothing is sent without your review.</p>
                <small>PROPOSED REPLY · NOT SENT</small>
                <blockquote>
                  “I can offer two for ₦22,000, plus ₦1,500 delivery to Yaba.”
                </blockquote>
                <div
                  className={styles.phoneReviewActions}
                  aria-label="Illustrated review actions, not interactive"
                >
                  <span>
                    <Check size={12} aria-hidden="true" />
                    Approve reply
                  </span>
                  <span>Edit</span>
                </div>
              </div>
              <p className={styles.phoneSafe}>
                <ShieldCheck size={11} aria-hidden="true" /> Your prices stay protected.
              </p>
            </div>
            <div
              className={styles.phoneNavigation}
              aria-label="Illustrative mobile navigation, not interactive"
            >
              {navigation
                .filter((item) => item.name !== 'Insights')
                .map(({ Icon, name }) => (
                  <span key={name} className={name === 'Inbox' ? styles.phoneActive : ''}>
                    <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                    {name}
                  </span>
                ))}
            </div>
            <span className={styles.homeIndicator} aria-hidden="true" />
          </div>
        </div>
        <p className={styles.stageNote}>
          <span /> At your desk. On your phone.
          <br />
          <strong>Always in your hands.</strong>
        </p>
      </div>
      <figcaption className={styles.caption}>
        <span>
          Illustrative interfaces with fictional data. No real messages, orders or payments.
        </span>
        <a href="/app">
          Explore the actual sample workspace <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
