'use client';
import { useId, useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  ImagePlus,
  Inbox,
  MessageCircle,
  Package,
  ShieldCheck,
} from 'lucide-react';
import styles from './homepage.module.css';

const steps = [
  {
    id: 'catalogue',
    icon: Camera,
    title: 'A photo. A few taps. Your catalogue.',
    text: 'Start with what you sell. Review the details before anything is saved.',
  },
  {
    id: 'inbox',
    icon: Inbox,
    title: 'All the context, in one conversation.',
    text: 'Keep customer messages and product details close, without the tab-hopping.',
  },
  {
    id: 'approval',
    icon: ShieldCheck,
    title: 'The important decisions stay yours.',
    text: 'Review an exception, adjust a reply, or take over the conversation.',
  },
  {
    id: 'order',
    icon: Package,
    title: 'From “I want it” to a clear next step.',
    text: 'Bring agreed details into an order you can review and follow through.',
  },
] as const;

export function ProductWalkthrough() {
  const [active, setActive] = useState(0);
  const [approved, setApproved] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  return (
    <div className={styles.walkthrough}>
      <div
        className={styles.featureTabs}
        role="tablist"
        aria-label="Explore the Selvora workflow"
        aria-orientation="vertical"
      >
        {steps.map((step, index) => (
          <button
            type="button"
            key={step.id}
            role="tab"
            id={`${id}-${step.id}-tab`}
            aria-selected={active === index}
            aria-controls={`${id}-panel`}
            tabIndex={active === index ? 0 : -1}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            className={`${styles.featureTab} ${active === index ? styles.featureTabActive : ''}`}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
                next = (index + 1) % steps.length;
              else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
                next = (index + steps.length - 1) % steps.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = steps.length - 1;
              else return;
              event.preventDefault();
              setActive(next);
              tabs.current[next]?.focus();
            }}
          >
            <span className={styles.featureIcon}>
              <step.icon size={21} aria-hidden="true" />
            </span>
            <span>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </span>
            <ChevronRight size={18} className={styles.featureChevron} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div
        className={styles.demoPanel}
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${steps[active].id}-tab`}
        tabIndex={0}
      >
        <div className={styles.demoTopbar}>
          <span className={styles.demoShop}>
            <span aria-hidden="true">T</span> Tola’s everyday store
          </span>
          <span className={styles.demoLabel}>Demonstration</span>
        </div>
        {active === 0 && (
          <div className={styles.catalogueDemo}>
            <div className={styles.demoSectionHeading}>
              <span className={styles.miniEyebrow}>PHOTO-FIRST CATALOGUE</span>
              <h3>Meet your next bestseller.</h3>
              <p>A photo is the starting point. You confirm the facts.</p>
            </div>
            <div className={styles.productDraft}>
              <div className={styles.productPhoto}>
                <img
                  src="/images/sample-adire-tote.webp"
                  width="640"
                  height="640"
                  alt="AI-generated demonstration photo of a teal and cream adire tote bag"
                  loading="lazy"
                  decoding="async"
                />
                <span>
                  <Camera size={13} aria-hidden="true" /> Sample product photo
                </span>
              </div>
              <div className={styles.productFacts}>
                <span className={styles.reviewPill}>Draft · review first</span>
                <h4>Everyday adire tote</h4>
                <p>Teal & cream · cotton</p>
                <dl>
                  <div>
                    <dt>Price</dt>
                    <dd>₦12,000</dd>
                  </div>
                  <div>
                    <dt>In stock</dt>
                    <dd>12 pieces</dd>
                  </div>
                </dl>
                <span className={styles.factNote}>
                  <Check size={14} aria-hidden="true" /> Your prices. Your product facts.
                </span>
              </div>
            </div>
            <div className={styles.demoPrompt}>
              <ImagePlus size={19} aria-hidden="true" />
              <span>“Add this tote. It’s ₦12,000. I have 12.”</span>
            </div>
            <p className={styles.demoFootnote}>
              Illustrative flow. Live photo extraction is still in development.
            </p>
          </div>
        )}
        {active === 1 && (
          <div className={styles.inboxDemo}>
            <div className={styles.demoSectionHeading}>
              <span className={styles.miniEyebrow}>UNIFIED INBOX</span>
              <h3>Pick up the conversation, not the pieces.</h3>
            </div>
            <div className={styles.demoConversation}>
              <div className={styles.demoCustomer}>
                <span aria-hidden="true">A</span>
                <div>
                  <strong>Amaka Bello</strong>
                  <span>Sample customer · WhatsApp</span>
                </div>
                <MessageCircle size={19} aria-hidden="true" />
              </div>
              <p className={styles.customerBubble}>
                Hi! Is the adire tote available? I need two for a gift.
              </p>
              <div className={styles.assistantBubble}>
                <span>Selvora · sample reply</span>
                <p>
                  Yes, the teal and cream tote is ₦12,000 each. Two would be ₦24,000. Where would
                  you like them delivered?
                </p>
                <CheckCheck size={15} aria-hidden="true" />
              </div>
              <p className={styles.contextNote}>
                <Package size={16} aria-hidden="true" /> Product, price and stock stay in context.
              </p>
            </div>
            <p className={styles.demoFootnote}>
              Fictional conversation. Channel availability depends on your connected accounts.
            </p>
          </div>
        )}
        {active === 2 && (
          <div className={styles.approvalDemo}>
            <div className={styles.demoSectionHeading}>
              <span className={styles.miniEyebrow}>YOUR APPROVAL</span>
              <h3>A little help. Never a blank cheque.</h3>
            </div>
            <div className={styles.approvalRequest}>
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>Amaka asked for a discount</strong>
                <p>“Can I get the two totes for ₦20,000?”</p>
              </div>
            </div>
            <p className={styles.approvalReason}>
              That’s below your sample minimum of ₦11,000 each. Here’s a reply you can review.
            </p>
            <blockquote className={styles.suggestedReply}>
              “I can offer both for ₦22,000. Would you like me to set them aside?”
            </blockquote>
            <div className={styles.approvalActions}>
              <button
                type="button"
                className={styles.demoApprove}
                disabled={approved}
                onClick={() => setApproved(true)}
              >
                {approved ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <CheckCheck size={16} aria-hidden="true" />
                )}
                {approved ? 'Approved in this demo' : 'Try approving this reply'}
              </button>
              {approved && (
                <button
                  type="button"
                  className={styles.resetDemo}
                  onClick={() => setApproved(false)}
                >
                  Reset demo
                </button>
              )}
            </div>
            <p role="status" className={styles.demoFeedback}>
              {approved
                ? 'Demo reply approved. No message was sent and no order was changed.'
                : 'Try it here. This demonstration never sends a message.'}
            </p>
          </div>
        )}
        {active === 3 && (
          <div className={styles.orderDemo}>
            <div className={styles.demoSectionHeading}>
              <span className={styles.miniEyebrow}>CONVERSATION TO ORDER</span>
              <h3>The details, no longer scattered.</h3>
            </div>
            <div className={styles.orderHeading}>
              <div>
                <span>Sample order</span>
                <strong>SV-DEMO-014</strong>
              </div>
              <span className={styles.reviewPill}>Draft · for review</span>
            </div>
            <dl className={styles.orderFacts}>
              <div>
                <dt>Customer</dt>
                <dd>Amaka Bello</dd>
              </div>
              <div>
                <dt>Items</dt>
                <dd>2 × Everyday adire tote</dd>
              </div>
              <div>
                <dt>Agreed item total</dt>
                <dd>₦22,000</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>To be confirmed</dd>
              </div>
            </dl>
            <div className={styles.paymentNote}>
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <strong>Payment not confirmed</strong>
                <p>
                  Your customer pays you directly. A screenshot or a payment claim is not
                  verification.
                </p>
              </div>
            </div>
            <p className={styles.demoFootnote}>
              Illustrative order, not a receipt. Review details before confirming.
            </p>
          </div>
        )}
      </div>
      <div className={styles.walkthroughCaption}>
        <p>
          Fictional products, people and messages. This walkthrough explains the experience; it is
          not live business activity.
        </p>
        <a href="/app">
          Explore the sample workspace <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
