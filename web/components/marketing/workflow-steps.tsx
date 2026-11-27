import {
  ArrowDown,
  ArrowRight,
  Check,
  FileText,
  Mail,
  MessageCircle,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { sampleSale } from './demo-data';
import styles from './workflow-steps.module.css';

const steps = [
  {
    title: 'Connect your business',
    label: 'START WITH YOUR FACTS',
    text: 'Set up your business details, catalogue and rules. Connect supported channels when they’re ready—not before.',
    note: 'Gmail first; WhatsApp next. Live-provider acceptance is still pending.',
  },
  {
    title: 'Manage customer conversations',
    label: 'KEEP THE CONTEXT',
    text: 'See the customer’s question alongside the facts that help you answer. Review exceptions or take over when a human touch matters.',
    note: 'Assistance stays within known facts, your minimum prices and your permissions.',
  },
  {
    title: 'Organise orders and payments',
    label: 'MAKE THE NEXT STEP CLEAR',
    text: 'Turn agreed details into an order draft. Track its status, record a verified payment and preserve the confirmed details in a receipt.',
    note: 'Customers pay you directly. A screenshot never confirms a payment.',
  },
  {
    title: 'Understand your business',
    label: 'LOOK BACK. MOVE FORWARD.',
    text: 'Review recorded orders, conversations and sales activity. Find the questions and products worth paying attention to next.',
    note: 'Historical insights, not forecasts. Live-data and numerical acceptance are still in progress.',
  },
] as const;

function StepScene({ index }: { index: number }) {
  if (index === 0)
    return (
      <div className={styles.setupScene}>
        <div className={styles.businessHeader}>
          <span>{sampleSale.owner[0]}</span>
          <div>
            <strong>{sampleSale.vendor}</strong>
            <small>Fictional business setup</small>
          </div>
          <ShieldCheck size={19} aria-hidden="true" />
        </div>
        <div className={styles.factRow}>
          <span>Business facts</span>
          <span>
            Vendor reviewed <Check size={12} aria-hidden="true" />
          </span>
        </div>
        <div className={styles.factRow}>
          <span>Minimum price</span>
          <span>
            Set by you <Check size={12} aria-hidden="true" />
          </span>
        </div>
        <div className={styles.channelRow}>
          <Mail size={17} aria-hidden="true" />
          <strong>Gmail</strong>
          <span>First · validation pending</span>
        </div>
        <div className={styles.channelRow}>
          <MessageCircle size={17} aria-hidden="true" />
          <strong>WhatsApp</strong>
          <span>Next · validation pending</span>
        </div>
      </div>
    );
  if (index === 1)
    return (
      <div className={styles.conversationScene}>
        <span className={styles.sceneLabel}>FICTIONAL CONVERSATION</span>
        <div className={styles.question}>
          <span>A</span>
          <p>“Do you have two indigo totes?”</p>
        </div>
        <div className={styles.contextRow}>
          <img
            src="/images/adire-tote-indigo.webp"
            alt="AI-generated sample indigo tote"
            loading="lazy"
            width="70"
            height="70"
          />
          <div>
            <strong>Everyday adire tote</strong>
            <span>12 in stock · ₦12,000 each</span>
            <small>Vendor-supplied sample facts</small>
          </div>
        </div>
        <div className={styles.assistanceNote}>
          <ShieldCheck size={16} aria-hidden="true" />
          <p>
            Known facts help the reply.
            <br />
            <strong>Exceptions come back to you.</strong>
          </p>
        </div>
      </div>
    );
  if (index === 2)
    return (
      <div className={styles.orderScene}>
        <div className={styles.orderTop}>
          <Package size={21} aria-hidden="true" />
          <div>
            <strong>Sample order #{sampleSale.orderId}</strong>
            <span>Amaka Bello · two indigo totes</span>
          </div>
        </div>
        <div className={styles.orderAmount}>
          <span>Agreed total, including delivery</span>
          <strong>₦23,500</strong>
        </div>
        <div className={styles.recordLine}>
          <span>
            <Check size={14} aria-hidden="true" /> Draft reviewed
          </span>
          <ArrowRight size={14} aria-hidden="true" />
          <span>Awaiting payment</span>
        </div>
        <p className={styles.recordNote}>
          <FileText size={15} aria-hidden="true" /> Receipt follows explicit payment confirmation.
        </p>
      </div>
    );
  return (
    <div className={styles.insightScene}>
      <div className={styles.chartHeader}>
        <span>RECORDED ORDER ACTIVITY</span>
        <span>Fictional example</span>
      </div>
      <div
        className={styles.bars}
        role="img"
        aria-label="Fictional order counts: Monday 2, Tuesday 3, Wednesday 1, Thursday 4, Friday 3. Not business performance."
      >
        {[
          ['M', 2],
          ['T', 3],
          ['W', 1],
          ['T', 4],
          ['F', 3],
        ].map(([day, value], i) => (
          <div key={i}>
            <span style={{ height: `${Number(value) * 28}px` }} />
            <small>{day}</small>
          </div>
        ))}
      </div>
      <div className={styles.insightFoot}>
        <span>Past activity. Clearer context.</span>
        <span>Not a forecast.</span>
      </div>
    </div>
  );
}

export function WorkflowSteps() {
  return (
    <ol className={styles.steps} aria-label="How Invend works" data-testid="workflow-stack">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={styles.step}
          style={{ '--step': index } as React.CSSProperties}
        >
          <div className={styles.stepBar}>
            <span>0{index + 1}</span>
            <span>{step.label}</span>
            <ArrowDown size={15} aria-hidden="true" />
          </div>
          <div className={styles.stepBody}>
            <div className={styles.stepCopy}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <small>{step.note}</small>
            </div>
            <StepScene index={index} />
          </div>
        </li>
      ))}
    </ol>
  );
}
