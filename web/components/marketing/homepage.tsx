import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Hand,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Brand } from './brand';
import { HomeHeader } from './home-header';
import { ProductWalkthrough } from './product-walkthrough';
import styles from './homepage.module.css';

const questions = [
  {
    question: 'Do I still control what the assistant says?',
    answer:
      'Yes. Your product facts, prices and limits guide the assistant. Requests outside those limits come to you for review. You can edit a suggested reply, reject it, or take over a conversation yourself.',
  },
  {
    question: 'Who receives my customer’s payment?',
    answer:
      'You do. Customer payments go directly to the vendor. A payment is confirmed by you or a verified integration—not by a screenshot or a customer saying “I’ve paid.” Paystack is for Selvora software subscriptions, not collecting your customers’ money.',
  },
  {
    question: 'Can I explore without connecting my business?',
    answer:
      'Yes. The sample workspace uses fictional conversations, products and orders so you can explore the existing workflows. No real messages or payments are sent. It is separate from creating an account or connecting your own channels.',
  },
  {
    question: 'Is everything in the walkthrough available today?',
    answer:
      'The walkthrough is an illustration, not a live account. Automatic lead qualification and live photo extraction are still in development. Availability depends on the connected service; sample interactions are always identified. Selvora is a digital assistant, not a physical shop robot.',
  },
];

export function Homepage() {
  return (
    <div className={styles.home}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <section className={`${styles.container} ${styles.hero}`} aria-labelledby="home-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.smallMark} aria-hidden="true" /> A LITTLE LESS BUSYWORK
            </p>
            <h1 id="home-title">
              More conversations.
              <br />
              <span>Less back-and-forth.</span>
            </h1>
            <p className={styles.heroDescription}>
              Meet Selvora, your AI sales assistant. For online vendors with busy inboxes, and
              customers who deserve a little more attention.
            </p>
            <p className={styles.heroSupporting}>
              Keep conversations, product details and orders together.
              <br className={styles.desktopBreak} /> Let your assistant help. Keep the important
              decisions.
            </p>
            <div className={styles.heroActions}>
              <Button asChild className={styles.primaryButton}>
                <a href="/app?auth=sign-up">
                  Get started <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </Button>
              <a className={styles.secondaryLink} href="#how-it-works">
                See how it works <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
            <p className={styles.heroReassurance}>
              <ShieldCheck size={16} aria-hidden="true" /> Your business. Your rules. Your final
              say.
            </p>
          </div>
          <figure className={styles.heroVisual}>
            <div className={styles.sceneFrame}>
              <img
                className={styles.scene}
                src="/images/selvora-shop.webp"
                srcSet="/images/selvora-shop-small.webp 640w, /images/selvora-shop.webp 1440w"
                sizes="(max-width: 899px) calc(100vw - 40px), (max-width: 1240px) 49vw, 610px"
                width="1440"
                height="960"
                fetchPriority="high"
                alt="Illustration of an AI assistant helping a customer at a Nigerian roadside shop, with a dotted connection to the business owner receiving a phone notification."
              />
              <div className={styles.shopLabel}>
                <span aria-hidden="true" /> AT THE SHOP. IN YOUR CORNER.
              </div>
            </div>
            <div className={styles.ownerNotification}>
              <span className={styles.notificationIcon}>
                <Bell size={19} aria-hidden="true" />
              </span>
              <div>
                <span className={styles.notificationMeta}>
                  SELVORA <span>Demo notification</span>
                </span>
                <strong>A decision for you, not another distraction.</strong>
                <p>Amaka asked for a discount. You have the final say.</p>
              </div>
              <Check size={17} className={styles.notificationCheck} aria-hidden="true" />
            </div>
            <figcaption>An illustrated idea of your digital assistant at work.</figcaption>
          </figure>
        </section>

        <div className={`${styles.container} ${styles.problemStrip}`}>
          <p>
            For the days when
            <br />
            <strong>everyone asks at once.</strong>
          </p>
          <span>
            <MessageCircle size={21} aria-hidden="true" /> “Is this available?”
          </span>
          <span>
            <Camera size={21} aria-hidden="true" /> “Which colour do you have?”
          </span>
          <span>
            <Hand size={21} aria-hidden="true" /> “Can you do a better price?”
          </span>
        </div>

        <section
          id="features"
          className={`${styles.container} ${styles.features}`}
          aria-labelledby="features-title"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>LESS SWITCHING. MORE CONTEXT.</p>
              <h2 id="features-title">
                One conversation.
                <br />A clearer next step.
              </h2>
            </div>
            <p>
              From the first product question to the order details, Selvora brings the pieces
              together. Here’s a small, interactive look at the experience.
            </p>
          </div>
          <ProductWalkthrough />
        </section>

        <section
          id="how-it-works"
          className={`${styles.container} ${styles.howItWorks}`}
          aria-labelledby="how-title"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>PHOTO. TAP. CHAT.</p>
              <h2 id="how-title">
                An assistant that starts
                <br />
                with your business.
              </h2>
            </div>
            <p>
              No need to hand over the reins. Give Selvora the facts, set your boundaries, and stay
              close to the conversations that need you.
            </p>
          </div>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber}>
                01 <Camera size={20} aria-hidden="true" />
              </span>
              <h3>Share what you sell.</h3>
              <p>
                Start with your products, photos and prices. Check the details so your assistant
                works from your facts, not guesses.
              </p>
            </li>
            <li>
              <span className={styles.stepNumber}>
                02 <MessageCircle size={20} aria-hidden="true" />
              </span>
              <h3>Keep the conversation moving.</h3>
              <p>
                Bring in a supported sales channel. Let the assistant help with routine questions
                within the limits you set.
              </p>
            </li>
            <li>
              <span className={styles.stepNumber}>
                03 <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <h3>Step in where it counts.</h3>
              <p>
                Review exceptions, take over a chat, and confirm order details. Your judgement stays
                at the heart of the business.
              </p>
            </li>
          </ol>
        </section>

        <section
          id="your-control"
          className={styles.controlSection}
          aria-labelledby="control-title"
        >
          <div className={`${styles.container} ${styles.controlInner}`}>
            <div className={styles.controlCopy}>
              <p className={styles.eyebrow}>HELP THAT KNOWS ITS LIMITS</p>
              <h2 id="control-title">
                An extra pair of hands.
                <br />
                Not a replacement
                <br className={styles.desktopBreak} /> for yours.
              </h2>
              <p>
                You’ve built the relationships. Selvora is here to help you look after them—not make
                promises on your behalf.
              </p>
              <a href="/app">
                See the sample approval workflow <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <ul className={styles.controlList}>
              <li>
                <span>
                  <Check size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3>Your prices and boundaries.</h3>
                  <p>
                    Product facts and price limits come from you. An exception is a reason to ask,
                    not permission to guess.
                  </p>
                </div>
              </li>
              <li>
                <span>
                  <Check size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3>Your voice. Your final say.</h3>
                  <p>
                    Review a suggested reply, make a change, or take over. Human control is part of
                    the workflow, not a workaround.
                  </p>
                </div>
              </li>
              <li>
                <span>
                  <Check size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3>Your customer pays you.</h3>
                  <p>
                    You confirm a payment or use a verified integration. A screenshot or payment
                    claim never counts as verification.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className={`${styles.container} ${styles.faq}`} aria-labelledby="faq-title">
          <div>
            <p className={styles.eyebrow}>A FEW THINGS WORTH KNOWING</p>
            <h2 id="faq-title">
              Clear from
              <br />
              the start.
            </h2>
            <p>
              A helpful assistant should come
              <br className={styles.desktopBreak} /> with clear boundaries.
            </p>
          </div>
          <div className={styles.faqList}>
            {questions.map(({ question, answer }) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.finalCta}`} aria-labelledby="start-title">
          <div>
            <p className={styles.eyebrow}>MAKE ROOM FOR WHAT’S NEXT</p>
            <h2 id="start-title">Your next customer is a conversation away.</h2>
            <p>Let’s make it a little easier to be there for them.</p>
          </div>
          <div>
            <Button asChild className={styles.primaryButton}>
              <a href="/app?auth=sign-up">
                Get started with Selvora <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </Button>
            <a className={styles.trySample} href="/app">
              Or explore the sample workspace <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <div>
            <a href="/" aria-label="Selvora home">
              <Brand />
            </a>
            <p>Your business, in good hands.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#your-control">Your control</a>
            <a href="/app?auth=sign-in">Sign in</a>
          </nav>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>© {new Date().getUTCFullYear()} Selvora</span>
          <span>Built around conversations. Designed for people.</span>
          <a href="#home-title">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
