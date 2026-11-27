import { ArrowRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { ProductShowcase } from './product-showcase';
import { HeroInstall } from './hero-install';
import styles from './home-hero.module.css';

export function HomeHero() {
  return (
    <section id="home" tabIndex={-1} className={styles.hero} aria-labelledby="home-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span aria-hidden="true" /> YOUR BUSINESS, BETTER CONNECTED
        </p>
        <h1 id="home-title" className={styles.title}>
          <span>Every customer conversation.</span> <span>Every order. One workspace.</span>
        </h1>
        <p className={styles.description}>
          Bring your customer conversations, product catalogue and orders together. Let AI handle
          routine enquiries while you stay in control of your business.
        </p>
        <div className={styles.actions}>
          <a href="/app?auth=sign-up" data-primary-cta className={styles.primary}>
            Get started <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a href="#how-it-works" className={styles.secondary}>
            See how it works <ArrowRight size={17} aria-hidden="true" />
          </a>
          <HeroInstall />
        </div>
        <p className={styles.note}>
          <ShieldCheck size={13} aria-hidden="true" /> Your rules. Your approvals. Wherever you
          work.
        </p>
      </div>
      <ProductShowcase />
    </section>
  );
}
