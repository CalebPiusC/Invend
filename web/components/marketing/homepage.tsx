import { ArrowRight, ArrowUpRight, ArrowUp, ChevronDown, ShieldCheck } from 'lucide-react';
import { Brand } from './brand';
import { HomeHeader } from './home-header';
import { SignatureScene } from './signature-scene';
import { WorkspacePreview } from './workspace-preview';
import { WorkflowExplorer } from './workflow-explorer';
import { IntegrationMap, IntegrationStatus } from './integration-status';
import styles from './homepage.module.css';

const questions = [
  [
    'Does Invend decide my prices?',
    'No. Your catalogue and minimum prices are the source of truth. Deterministic checks put your business facts and pricing rules before the reply. A request outside those boundaries needs a human decision; missing information means asking, not inventing an answer.',
  ],
  [
    'Which integrations come first?',
    'Gmail is our first priority, followed by WhatsApp. Both have implementations awaiting live-provider acceptance. Instagram and Facebook Messenger come later and are planned, not available connections. TikTok is under review; SMS is exploratory and not supported.',
  ],
  [
    'Can a photo create my catalogue automatically?',
    'The photo-first review workflow is demonstrated here. Live extraction and durable catalogue photo storage are still in development. Product names, variants, prices and stock must be checked and confirmed by the vendor.',
  ],
  [
    'Who receives and confirms customer payments?',
    'Your customer pays your business directly. You confirm payment, or use an appropriately verified integration. A screenshot or a customer saying “I’ve paid” is not verification. Paystack is for Invend subscriptions, not collecting your customers’ money.',
  ],
] as const;

const plans = [
  {
    name: 'Starter',
    description: 'For finding your rhythm and organising the everyday.',
    label: 'A considered beginning',
  },
  {
    name: 'Growth',
    description: 'For a growing business and the next chapter of your team.',
    label: 'Room for what’s next',
  },
  {
    name: 'Scale',
    description: 'For busier operations with more people in the conversation.',
    label: 'A bigger conversation',
  },
] as const;

export function Homepage() {
  return (
    <div className={styles.home}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <section id="home" className={styles.hero} aria-labelledby="home-title">
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>YOUR BUSINESS, WORKING BETTER.</p>
                <h1 id="home-title">
                  More sales.
                  <br />
                  <span>Still your call.</span>
                </h1>
                <p className={styles.heroDescription}>
                  Turn customer conversations into sales. Let Invend help with the replies,
                  recommendations and order details—while you stay in control of your business.
                </p>
                <div className={styles.heroActions}>
                  <a href="/app?auth=sign-up" className={styles.primaryButton}>
                    Get started <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <a className={styles.secondaryButton} href="#how-it-works">
                    See Invend in action <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <p className={styles.heroNote}>
                  <ShieldCheck size={14} aria-hidden="true" /> Your prices. Your approvals. Always
                  your business.
                </p>
              </div>
              <SignatureScene />
            </div>
            <div
              className={styles.channelStrip}
              aria-label="Integration priorities, not live connections"
            >
              <p>
                BUILT FOR THE WAY YOU SELL<span>Our integration priorities</span>
              </p>
              <div>
                <strong>Gmail</strong>
                <span>01 / First priority</span>
              </div>
              <div>
                <strong>WhatsApp</strong>
                <span>02 / Next priority</span>
              </div>
              <div>
                <strong>Instagram & Facebook</strong>
                <span>Later / Planned</span>
              </div>
              <a href="#integrations">
                See what’s ready <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="ai-sales-assistant"
          className={styles.workspaceSection}
          aria-labelledby="workspace-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>A CLEARER VIEW. A STRONGER BUSINESS.</p>
                <h2 id="workspace-title">
                  Your sales operation.
                  <br />
                  One intelligent workspace.
                </h2>
              </div>
              <p>
                Every conversation, product fact and order.
                <br />
                Connected, not complicated.
              </p>
            </div>
            <WorkspacePreview />
            <WorkflowExplorer />
          </div>
        </section>

        <section
          id="integrations"
          className={styles.integrationsSection}
          aria-labelledby="integrations-title"
        >
          <div className={styles.container}>
            <div className={styles.integrationsGrid}>
              <div className={styles.integrationCopy}>
                <p className={styles.eyebrow}>BETTER TOGETHER.</p>
                <h2 id="integrations-title">
                  Your conversations.
                  <br />
                  One centre of gravity.
                </h2>
                <p>
                  Start with Gmail. Bring WhatsApp next. Instagram and Facebook follow later—not
                  before they’re ready.
                </p>
                <p className={styles.integrationNote}>
                  One workspace is the direction. Each connection still needs its own permissions
                  and live validation.
                </p>
                <a href="#integration-readiness" className={styles.secondaryButton}>
                  Explore integration status <ArrowRight size={15} aria-hidden="true" />
                </a>
              </div>
              <IntegrationMap />
            </div>
            <IntegrationStatus />
          </div>
        </section>

        <section id="pricing" className={styles.pricingSection} aria-labelledby="pricing-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>SIMPLE PRICING. SERIOUS POSSIBILITIES.</p>
                <h2 id="pricing-title">Room to grow. A plan to match.</h2>
              </div>
              <a href="/app" className={styles.textLink}>
                Explore the sample <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <p className={styles.pricingIntro}>
              Illustrative plan previews, not established plans or purchase offers. Subscription
              prices and usage allowances are not published in this preview. Demo product prices are
              not subscription quotes.
            </p>
            <div className={styles.plans}>
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`${styles.plan} ${plan.name === 'Growth' ? styles.featuredPlan : ''}`}
                  aria-label={`${plan.name} plan preview`}
                >
                  <div className={styles.planTop}>
                    <h3>{plan.name}</h3>
                    {plan.name === 'Growth' && <span>PLAN PREVIEW</span>}
                  </div>
                  <p className={styles.planPromise}>{plan.label}</p>
                  <p className={styles.planPrice}>Pricing to be confirmed</p>
                  <p className={styles.planDescription}>{plan.description}</p>
                  <a
                    href="/app"
                    className={
                      plan.name === 'Growth' ? styles.primaryButton : styles.secondaryButton
                    }
                  >
                    Explore the demo <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
            <p className={styles.paymentNote}>
              <ShieldCheck size={16} aria-hidden="true" /> Customer payments go directly to your
              business. Your Invend subscription is separate.
            </p>
          </div>
        </section>

        <section id="about" className={styles.aboutSection} aria-labelledby="about-title">
          <div className={`${styles.container} ${styles.aboutGrid}`}>
            <div className={styles.aboutCopy}>
              <p className={styles.eyebrow}>BUILT AROUND YOUR BUSINESS.</p>
              <h2 id="about-title">
                Less busywork.
                <br />
                More room for what’s next.
              </h2>
              <p>
                Invend starts with daily sales operations: enquiries, business-aware replies,
                pricing guardrails and orders. Our longer-term direction is an{' '}
                <strong>AI Commerce Growth Platform</strong>—not a claim that every capability is
                live today.
              </p>
            </div>
            <div className={styles.faqList} data-testid="homepage-faq">
              {questions.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="start-title">
          <div className={`${styles.container} ${styles.finalInner}`}>
            <div>
              <p className={styles.eyebrow}>LESS BUSYWORK. MORE BUSINESS.</p>
              <h2 id="start-title">
                Make room for
                <br />
                your next chapter.
              </h2>
              <p>Give the routine questions a little help. Keep the decisions that matter.</p>
            </div>
            <div className={styles.finalActions}>
              <a href="/app?auth=sign-up" className={styles.primaryButton}>
                Get started with Invend <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href="/app" className={styles.textLink}>
                Or explore the sample workspace <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <div>
            <a href="#home" aria-label="Invend home">
              <Brand />
            </a>
            <p>Your business, in good hands.</p>
          </div>
          <nav aria-label="Footer navigation" className={styles.footerLinks}>
            <a href="#ai-sales-assistant">Product</a>
            <a href="#integrations">Integrations</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="/app?auth=sign-in">Sign in</a>
          </nav>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>© {new Date().getUTCFullYear()} Invend</span>
          <span>Illustrative demos. No live messages or payments.</span>
          <a href="#home">
            Back to top <ArrowUp size={13} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
