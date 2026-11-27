import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Inbox,
  LockKeyhole,
  Mail,
  MessageCircle,
  Package,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Brand } from './brand';
import { BrandIcon } from '../brand-icon';
import { HomeHeader } from './home-header';
import { HomeHero } from './home-hero';
import { FeatureTour } from './feature-tour';
import { WorkflowSteps } from './workflow-steps';
import { OwnerControl } from './owner-control';
import { InteractiveIntegrations } from './integration-status';
import styles from './homepage.module.css';

const questions = [
  [
    'Does Invend decide my prices?',
    'No. Your catalogue and minimum prices are the source of truth. Deterministic checks put business facts and pricing rules before a reply. Discounts outside those boundaries, complaints, refunds and uncertain answers need a human decision.',
  ],
  [
    'Can a photo create my catalogue automatically?',
    'Not in the current live product. The photo-first review workflow is demonstrated here; extraction and durable catalogue photo storage are still in development. You supply and confirm the names, variants, prices and stock.',
  ],
  [
    'Who receives customer payments?',
    'Your customer pays your business directly. You confirm payment, or use an appropriately verified integration. A screenshot or “I’ve paid” message is not verification. Paystack is for Invend subscriptions, not collecting your customers’ money.',
  ],
  [
    'Can I explore before connecting my business?',
    'Yes. The sample workspace uses fictional data to demonstrate the workflows. No customer messages are sent and no real payments are collected. Live channel availability is separate from the sample experience.',
  ],
] as const;

export function Homepage() {
  return (
    <div className={styles.home}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <HomeHero />
        <InteractiveIntegrations />

        <section id="the-problem" className={styles.problemSection} aria-labelledby="problem-title">
          <div className={`${styles.container} ${styles.problemGrid}`}>
            <div className={styles.sectionCopy}>
              <p className={styles.eyebrow}>SOUND FAMILIAR?</p>
              <h2 id="problem-title">
                The conversation moves.
                <br />
                The details get left behind.
              </h2>
              <p>
                A price in one chat. An order in another. A payment claim you still need to check.
              </p>
              <p>The work isn’t just replying. It’s remembering what happens next.</p>
            </div>
            <div
              className={styles.fragments}
              aria-label="Fictional examples of scattered sales conversations"
            >
              <div className={styles.fragment}>
                <span className={styles.fragmentIcon}>
                  <MessageCircle size={19} aria-hidden="true" />
                </span>
                <div>
                  <small>THE SAME QUESTION, AGAIN</small>
                  <p>“Is the indigo one still available?”</p>
                </div>
                <CircleHelp size={18} aria-hidden="true" />
              </div>
              <div className={styles.fragment}>
                <span className={styles.fragmentIcon}>
                  <Mail size={19} aria-hidden="true" />
                </span>
                <div>
                  <small>A FOLLOW-UP TO REMEMBER</small>
                  <p>“Can you send the order details?”</p>
                </div>
                <span className={styles.fragmentDash} aria-hidden="true">
                  —
                </span>
              </div>
              <div className={styles.fragment}>
                <span className={styles.fragmentIcon}>
                  <FileText size={19} aria-hidden="true" />
                </span>
                <div>
                  <small>A CLAIM, NOT A CONFIRMATION</small>
                  <p>“I’ve paid. Here’s a screenshot.”</p>
                </div>
                <LockKeyhole size={18} aria-hidden="true" />
              </div>
              <p className={styles.fragmentCaption}>
                Different places. One business to look after.
              </p>
            </div>
          </div>
        </section>

        <section
          id="the-solution"
          className={styles.solutionSection}
          aria-labelledby="solution-title"
        >
          <div className={styles.container}>
            <div className={styles.centerHead}>
              <p className={styles.eyebrow}>FROM SCATTERED TO CONNECTED.</p>
              <h2 id="solution-title">
                Everything comes together,
                <br />
                so you stay in control.
              </h2>
              <p>Keep the question, the facts and the next decision in the same story.</p>
            </div>
            <div className={styles.connection}>
              <div className={styles.ownerRail}>
                <span>
                  <ShieldCheck size={17} aria-hidden="true" /> Your rules. Your decisions.
                </span>
              </div>
              <ol className={styles.connectionFlow} aria-label="A connected sales workflow">
                {[
                  { icon: Inbox, title: 'The conversation', note: 'Customer context stays close.' },
                  {
                    icon: SlidersHorizontal,
                    title: 'The right facts',
                    note: 'Your prices, stock and rules.',
                  },
                  {
                    icon: Package,
                    title: 'An organised order',
                    note: 'Agreed details, ready to review.',
                  },
                  {
                    icon: FileText,
                    title: 'A clear record',
                    note: 'Payment status, then a receipt.',
                  },
                ].map(({ icon: Icon, title, note }, index) => (
                  <li key={title}>
                    <span className={styles.connectionIcon}>
                      <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className={styles.connectionNumber}>0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{note}</p>
                    {index < 3 && (
                      <ArrowRight className={styles.connectionArrow} size={18} aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ol>
              <p className={styles.connectionNote}>
                Assistance handles the routine. Exceptions come back to you.
              </p>
            </div>
          </div>
        </section>

        <section
          id="features"
          tabIndex={-1}
          className={styles.featuresSection}
          aria-labelledby="features-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>A LITTLE MORE CONNECTED.</p>
                <h2 id="features-title">
                  The tools behind
                  <br />a smoother sale.
                </h2>
              </div>
              <p>
                Explore the workflow, not just a feature list.
                <br />
                These are interactive, fictional examples—not live accounts.
              </p>
            </div>
            <FeatureTour />
          </div>
        </section>

        <section
          id="how-it-works"
          tabIndex={-1}
          className={styles.howSection}
          aria-labelledby="how-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>A NATURAL WAY TO WORK.</p>
                <h2 id="how-title">
                  From the first hello
                  <br />
                  to a clearer picture.
                </h2>
              </div>
              <p>
                Four connected steps.
                <br />
                One business, with you at the centre.
              </p>
            </div>
            <WorkflowSteps />
          </div>
        </section>

        <section
          id="owner-control"
          className={styles.controlSection}
          aria-labelledby="control-title"
        >
          <div className={`${styles.container} ${styles.controlGrid}`}>
            <div className={styles.sectionCopy}>
              <p className={styles.eyebrow}>INTELLIGENT ASSISTANCE. HUMAN JUDGEMENT.</p>
              <h2 id="control-title">
                Helpful by default.
                <br />
                Yours to decide.
              </h2>
              <p>
                Let routine replies start with verified business facts. Keep the sensitive decisions
                where they belong—with you.
              </p>
              <div className={styles.controlRules}>
                <div>
                  <Check size={18} aria-hidden="true" />
                  <p>
                    <strong>Inside your rules</strong>
                    <span>Known product details, stock and prices. No invented answers.</span>
                  </p>
                </div>
                <div>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <p>
                    <strong>Back to you</strong>
                    <span>
                      Discount exceptions, complaints, refunds, custom or bulk requests, and
                      uncertain answers.
                    </span>
                  </p>
                </div>
              </div>
              <p className={styles.smallNote}>
                You can take over a conversation. Consent still comes before a follow-up.
              </p>
            </div>
            <OwnerControl />
          </div>
        </section>

        <section
          id="pricing"
          tabIndex={-1}
          className={styles.pricingSection}
          aria-labelledby="pricing-title"
        >
          <div className={`${styles.container} ${styles.pricingGrid}`}>
            <div className={styles.sectionCopy}>
              <p className={styles.eyebrow}>CLEAR EXPECTATIONS. FROM THE START.</p>
              <h2 id="pricing-title">
                A considered product.
                <br />
                An honest starting point.
              </h2>
              <p>
                Take a look around. Understand how Invend works before deciding what comes next.
              </p>
              <a href="/app" className={styles.textLink}>
                Explore the sample workspace <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.pricingPanel}>
              <span className={styles.pricingLabel}>PRICING</span>
              <h3>
                Not yet published.
                <br />
                No guesswork here.
              </h3>
              <p>
                Subscription plans, prices and usage limits have not been announced. We won’t dress
                up sample numbers as a commercial offer.
              </p>
              <a href="/app?auth=sign-up" className={styles.primaryButton}>
                Get started <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <p className={styles.paymentNote}>
                <ShieldCheck size={17} aria-hidden="true" />
                Your customers pay your business directly. Your Invend subscription is separate.
              </p>
            </div>
          </div>
        </section>

        <section
          id="about"
          tabIndex={-1}
          className={styles.aboutSection}
          aria-labelledby="about-title"
        >
          <div className={`${styles.container} ${styles.aboutGrid}`}>
            <div className={styles.sectionCopy}>
              <p className={styles.eyebrow}>BUILT AROUND THE BUSINESS OWNER.</p>
              <h2 id="about-title">
                More room for
                <br />
                the work that matters.
              </h2>
              <p>
                Invend is being built for businesses that sell through conversations—from an owner
                managing every reply to a team handling a busy inbox.
              </p>
              <p>
                Our direction is an <strong>AI Commerce Growth Platform</strong>. We’re starting
                with the everyday: clearer conversations, organised sales operations and accountable
                assistance.
              </p>
              <p className={styles.aboutStatement}>
                <BrandIcon size={28} />
                Technology should support your judgement.
                <br />
                Not replace it.
              </p>
            </div>
            <div className={styles.faqList} data-testid="homepage-faq">
              <p className={styles.eyebrow}>A FEW THINGS WORTH KNOWING.</p>
              {questions.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="start-title">
          <div className={`${styles.container} ${styles.finalInner}`}>
            <p className={styles.eyebrow}>LESS BUSYWORK. MORE BUSINESS.</p>
            <h2 id="start-title">
              A clearer working day
              <br />
              starts with a conversation.
            </h2>
            <p>Bring the details together. Keep the decisions yours.</p>
            <a href="/app?auth=sign-up" className={styles.primaryButton}>
              Get started with Invend <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <div>
            <a href="#home" aria-label="Invend home">
              <Brand />
            </a>
            <p>
              Your business, in good hands.
              <br />
              Yours.
            </p>
          </div>
          <nav aria-label="Product">
            <h2>Product</h2>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#integrations">Integrations</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <nav aria-label="Company">
            <h2>Company</h2>
            <a href="#about">About Invend</a>
            <a href="#owner-control">Your control</a>
          </nav>
          <nav aria-label="Your workspace">
            <h2>Your workspace</h2>
            <a href="/app?auth=sign-in">Sign in</a>
            <a href="/app?auth=sign-up">
              Get started <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a href="/app">Explore the sample</a>
          </nav>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <p>© 2026 Invend</p>
          <p>Illustrative examples. No live messages or payments.</p>
          <a href="#home">
            Back to top <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
