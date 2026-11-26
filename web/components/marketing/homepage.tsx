import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Brand } from './brand';
import { HomeHeader } from './home-header';
import { SignatureScene } from './signature-scene';
import { IntegrationStatus } from './integration-status';
import {
  CatalogueDemo,
  HumanControlDemo,
  InboxDemo,
  LeadDemo,
  NegotiationDemo,
  OrderJourney,
} from './product-walkthrough';
import styles from './homepage.module.css';

const questions = [
  [
    'Does Invend decide my prices?',
    'No. Your catalogue and minimum prices are the source of truth. The reply workflow checks business facts and pricing rules. A request outside those boundaries needs a human decision; uncertainty is not permission to invent an answer.',
  ],
  [
    'Are all the integrations available now?',
    'No. Gmail and WhatsApp have implementations awaiting live-provider acceptance. Instagram and Facebook Messenger are planned. TikTok access is under review, and SMS is an integration to investigate—not a supported channel. The examples on this page are fictional demonstrations.',
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
                <p className={styles.eyebrow}>
                  <span aria-hidden="true" /> BUILT FOR THE WAY YOU SELL
                </p>
                <h1 id="home-title">
                  Every enquiry matters.
                  <br />
                  <span>Not every reply needs you.</span>
                </h1>
                <p className={styles.heroDescription}>
                  <strong>Meet Invend, your AI sales assistant.</strong> Help customers find the
                  right product, negotiate within your rules, and move towards an order—without
                  personally handling every “how much?”
                </p>
                <div className={styles.heroActions}>
                  <Button asChild className={styles.primaryButton}>
                    <a href="/app?auth=sign-up">
                      Get started <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                  </Button>
                  <a className={styles.textLink} href="#negotiation">
                    See a conversation unfold <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <p className={styles.heroNote}>
                  <ShieldCheck size={15} aria-hidden="true" /> Your prices. Your boundaries. Your
                  final say.
                </p>
              </div>
              <SignatureScene />
            </div>
            <div className={styles.heroFoot}>
              <span>
                <SlidersHorizontal size={16} aria-hidden="true" />{' '}
                <strong>Business-aware, by design.</strong> Not a chatbot guessing at your business.
              </span>
              <span>For online vendors, growing teams and very busy inboxes.</span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className={styles.workflow} aria-labelledby="workflow-title">
          <div className={styles.container}>
            <div className={styles.workflowTop}>
              <h2 id="workflow-title">A little structure. A lot less back-and-forth.</h2>
              <p>The workflow, from first question to next step.</p>
            </div>
            <ol className={styles.workflowSteps}>
              <li>
                <span>01</span>
                <div>
                  <strong>Show what you sell</strong>
                  <p>Photos, product facts and stock.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Set your boundaries</strong>
                  <p>Prices, delivery and approval rules.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Stay in the conversation</strong>
                  <p>Let routine replies flow. Review exceptions.</p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>Make the next step clear</strong>
                  <p>Follow up, confirm an order, keep a record.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section
          id="ai-sales-assistant"
          className={`${styles.section} ${styles.businessSection}`}
          aria-labelledby="business-title"
        >
          <div className={`${styles.container} ${styles.factLayout}`}>
            <div className={styles.factCopy}>
              <p className={styles.eyebrow}>01 / AN ASSISTANT THAT KNOWS YOUR BUSINESS</p>
              <h2 id="business-title">
                It should know your catalogue.
                <br />
                Not make one up.
              </h2>
              <p>
                A helpful reply starts with what you actually sell: the right variant, the current
                price, the available stock and the delivery rules you’ve confirmed.
              </p>
              <div className={styles.factPrinciple}>
                Deterministic checks put your facts and price limits ahead of the wording. Missing
                information means asking—not improvising.
              </div>
            </div>
            <div className={styles.factSheet}>
              <div className={styles.sheetHeading}>
                <div>
                  <strong>Tola’s business facts</strong>
                  <span>Fictional vendor-confirmed example · revision 3</span>
                </div>
                <LockKeyhole size={20} aria-hidden="true" />
              </div>
              <dl className={styles.factRows}>
                <div>
                  <dt>Product</dt>
                  <dd>Everyday adire tote</dd>
                </div>
                <div>
                  <dt>Variant</dt>
                  <dd>Indigo & cream · cotton</dd>
                </div>
                <div>
                  <dt>Listed price</dt>
                  <dd>₦12,000 each</dd>
                </div>
                <div>
                  <dt>Minimum allowed price</dt>
                  <dd>₦11,000 each</dd>
                </div>
                <div>
                  <dt>Available stock</dt>
                  <dd>12 pieces</dd>
                </div>
                <div>
                  <dt>Yaba delivery rule</dt>
                  <dd>₦1,500 · 2–3 working days</dd>
                </div>
              </dl>
              <p className={styles.factSource}>
                <Check size={14} aria-hidden="true" /> Example facts supplied by the vendor, not
                invented by the assistant.
              </p>
            </div>
          </div>
        </section>

        <section
          id="negotiation"
          className={`${styles.section} ${styles.lilacSection}`}
          aria-labelledby="negotiation-title"
        >
          <div className={styles.container}>
            <div className={styles.centerHeading}>
              <p className={styles.eyebrow}>02 / “WHAT’S YOUR LAST PRICE?”</p>
              <h2 id="negotiation-title">
                Flexible in the conversation.
                <br />
                Firm on your minimum.
              </h2>
              <p>
                Let customers negotiate without letting your margins become a guessing game. Within
                your rules, there’s a clear next step. Outside them, there’s you.
              </p>
            </div>
            <NegotiationDemo />
          </div>
        </section>

        <section
          id="smart-catalogue"
          className={`${styles.section} ${styles.businessSection}`}
          aria-labelledby="catalogue-title"
        >
          <div className={`${styles.container} ${styles.catalogueLayout}`}>
            <div className={styles.catalogueCopy}>
              <p className={styles.eyebrow}>03 / PHOTO FIRST. FACTS CONFIRMED.</p>
              <h2 id="catalogue-title">
                Your next product starts with a photo.
                <br />
                Not a spreadsheet.
              </h2>
              <p>
                Bring the product. Review the suggested details. Confirm what’s true. A few
                thoughtful taps should get you closer to selling, not deeper into admin.
              </p>
              <ul className={styles.simpleList}>
                <li>
                  <Check size={16} aria-hidden="true" /> Product photos with context, not another
                  empty table.
                </li>
                <li>
                  <Check size={16} aria-hidden="true" /> Prices, variants and stock stay yours to
                  confirm.
                </li>
                <li>
                  <Check size={16} aria-hidden="true" /> No silent publishing of unreviewed
                  information.
                </li>
              </ul>
              <p className={styles.developmentNote}>
                Illustrated product direction. Live photo extraction and durable photo storage are
                still in development.
              </p>
            </div>
            <CatalogueDemo />
          </div>
        </section>

        <section
          id="unified-inbox"
          className={`${styles.section} ${styles.darkSection}`}
          aria-labelledby="inbox-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>04 / ONE CUSTOMER. THE WHOLE CONVERSATION.</p>
                <h2 id="inbox-title">
                  Less switching channels.
                  <br />
                  More understanding people.
                </h2>
              </div>
              <p>
                A product question, a delivery detail, a previous order. Keep the context together
                so the next reply doesn’t start from scratch.
              </p>
            </div>
            <InboxDemo />
            <div id="integrations" className={styles.integrations}>
              <h3>Meet customers where they are. Be clear about what’s ready.</h3>
              <p>
                One workspace is the direction. Each channel still needs its own integration,
                permissions and live validation. See the current status before choosing where to
                connect.
              </p>
              <IntegrationStatus />
            </div>
          </div>
        </section>

        <section
          id="lead-management"
          className={`${styles.section} ${styles.leadSection}`}
          aria-labelledby="leads-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>05 / KEEP A GOOD ENQUIRY FROM GOING QUIET</p>
                <h2 id="leads-title">
                  “I’ll get back to you”
                  <br />
                  doesn’t have to be the end.
                </h2>
              </div>
              <p>
                Keep the customer’s interests, questions and next step in view. Follow up with
                context and consent—not a message that forgets the conversation.
              </p>
            </div>
            <LeadDemo />
          </div>
        </section>

        <section
          id="orders-and-payments"
          className={`${styles.section} ${styles.lilacSection}`}
          aria-labelledby="orders-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>06 / FROM “I WANT IT” TO A PROPER RECORD</p>
                <h2 id="orders-title">
                  The conversation is the beginning.
                  <br />
                  Not the whole process.
                </h2>
              </div>
              <p>
                Review the agreed items. Confirm delivery. Record a payment only after you’ve
                verified it. Give the customer a clear receipt—not another chat to search.
              </p>
            </div>
            <OrderJourney />
          </div>
        </section>

        <section
          id="team-management"
          className={`${styles.section} ${styles.controlSection}`}
          aria-labelledby="control-title"
        >
          <div className={`${styles.container} ${styles.controlLayout}`}>
            <div className={styles.controlCopy}>
              <p className={styles.eyebrow}>07 / YOUR BUSINESS DOESN’T RUN ON AUTOPILOT</p>
              <h2 id="control-title">
                An extra pair of hands.
                <br />
                You still hold the reins.
              </h2>
              <p>
                Review the proposed reply. Know which teammate is handling a customer. Take over
                when the conversation needs you, then hand it back when you’re ready.
              </p>
              <a className={styles.textLink} href="/app">
                Explore the existing sample workspace <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <HumanControlDemo />
          </div>
        </section>

        <section className={`${styles.section} ${styles.aboutPricing}`}>
          <div className={`${styles.container} ${styles.aboutLayout}`}>
            <div id="about" className={styles.aboutCopy}>
              <p className={styles.eyebrow}>BUILT AROUND THE WAY BUSINESS HAPPENS</p>
              <h2>
                Built for the conversation.
                <br />
                Growing beyond it.
              </h2>
              <p>
                People discover a product, ask a question, negotiate and buy in a conversation.
                Invend starts there: with the daily sales operations that deserve more attention and
                less busywork.
              </p>
              <p>
                Our direction is an <strong>AI Commerce Growth Platform</strong>. Our first focus is
                enquiries, business-aware replies, pricing guardrails, follow-ups and
                conversation-to-order workflows. The bigger ambition is a direction—not a claim that
                everything is live today.
              </p>
            </div>
            <div id="pricing" className={styles.pricingBox}>
              <p className={styles.eyebrow}>PRICING / NO GUESSWORK</p>
              <h2>
                A clear plan before you pay.
                <br />
                Your customer’s money stays yours.
              </h2>
              <p>
                Subscription prices and usage allowances are not published in this preview. The
                product prices in our demos are not subscription quotes.
              </p>
              <dl className={styles.pricingDetails}>
                <div>
                  <dt>Invend subscription</dt>
                  <dd>Software for your sales operations</dd>
                </div>
                <div>
                  <dt>Customer payments</dt>
                  <dd>Paid directly to your business</dd>
                </div>
                <div>
                  <dt>Confirmed plan pricing</dt>
                  <dd>Not published in this preview</dd>
                </div>
              </dl>
              <a href="/app" className={styles.textLink}>
                Explore the sample before you decide <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title">
          <div className={`${styles.container} ${styles.faqLayout}`}>
            <div>
              <p className={styles.eyebrow}>CLEAR FROM THE START</p>
              <h2 id="faq-title">
                Good questions.
                <br />
                Straight answers.
              </h2>
            </div>
            <div className={styles.faqList}>
              {questions.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <ChevronDown size={17} aria-hidden="true" />
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
              <p className={styles.eyebrow}>A LITTLE LESS “ALWAYS ONLINE”</p>
              <h2 id="start-title">
                Be there for your business.
                <br />
                <span>Not trapped in every chat.</span>
              </h2>
              <p>Give the routine questions a little help. Keep the decisions that matter.</p>
            </div>
            <div className={styles.finalActions}>
              <Button asChild className={styles.primaryButton}>
                <a href="/app?auth=sign-up">
                  Get started with Invend <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </Button>
              <a href="/app" className={styles.textLink}>
                Or explore the sample workspace <ArrowRight size={15} aria-hidden="true" />
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
            <a href="#home">Home</a>
            <a href="#ai-sales-assistant">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#integrations">Integrations</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="/app?auth=sign-in">Sign in</a>
          </nav>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>© {new Date().getUTCFullYear()} Invend</span>
          <span>Fictional demonstrations. Real boundaries.</span>
          <a href="#home">
            Back to top <ArrowUp size={13} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
