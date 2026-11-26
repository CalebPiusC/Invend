'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { Brand } from './brand';
import styles from './homepage.module.css';

const featureGroups = [
  {
    title: 'Sell with context',
    links: [
      ['AI Sales Assistant', 'Business facts. Not guesswork.', '#ai-sales-assistant'],
      ['Smart Catalogue', 'Start with a photo, confirm the details.', '#smart-catalogue'],
      ['Lead Management', 'Keep the next conversation in sight.', '#lead-management'],
    ],
  },
  {
    title: 'Stay in control',
    links: [
      ['Unified Inbox', 'The customer, not just the channel.', '#unified-inbox'],
      ['Orders and Payments', 'From agreed details to a clear record.', '#orders-and-payments'],
      ['Team Management', 'Know who is handling the conversation.', '#team-management'],
    ],
  },
] as const;

export function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const featureToggle = useRef<HTMLButtonElement>(null);
  const featurePanel = useRef<HTMLDivElement>(null);

  const close = () => {
    setMobileOpen(false);
    setFeaturesOpen(false);
  };

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (featuresOpen) {
        setFeaturesOpen(false);
        featureToggle.current?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        mobileToggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) close();
    };
    const desktop = window.matchMedia('(min-width: 1100px)');
    const resize = () => close();
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', resize);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', resize);
    };
  }, [mobileOpen, featuresOpen]);

  useEffect(() => {
    if (!featuresOpen) return;
    // Focus stays on the disclosure for pointer/Enter activation; Tab enters its links.
    // Arrow-key activation explicitly moves focus after the panel has opened.
    if (featureToggle.current?.dataset.focusLink) {
      const links = featurePanel.current?.querySelectorAll<HTMLAnchorElement>('a');
      const last = featureToggle.current.dataset.focusLink === 'last';
      (last ? links?.[links.length - 1] : links?.[0])?.focus();
      delete featureToggle.current.dataset.focusLink;
    }
  }, [featuresOpen]);

  return (
    <header
      className={styles.header}
      ref={header}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <div className={styles.headerInner}>
        <a href="#home" aria-label="Invend home" className={styles.brandLink} onClick={close}>
          <Brand />
        </a>
        <nav
          id="site-navigation"
          className={`${styles.siteNav} ${mobileOpen ? styles.siteNavOpen : ''}`}
          aria-label="Main navigation"
        >
          <a href="#home" aria-current="page" onClick={close}>
            Home
          </a>
          <div className={styles.featureDisclosure}>
            <button
              ref={featureToggle}
              type="button"
              aria-expanded={featuresOpen}
              aria-controls="feature-navigation"
              className={styles.featureToggle}
              onClick={() => setFeaturesOpen(!featuresOpen)}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                event.preventDefault();
                if (!featuresOpen) {
                  event.currentTarget.dataset.focusLink =
                    event.key === 'ArrowUp' ? 'last' : 'first';
                  setFeaturesOpen(true);
                } else {
                  const links = featurePanel.current?.querySelectorAll<HTMLAnchorElement>('a');
                  (event.key === 'ArrowUp' ? links?.[links.length - 1] : links?.[0])?.focus();
                }
              }}
            >
              Features <ChevronDown size={15} aria-hidden="true" />
            </button>
            <div
              id="feature-navigation"
              ref={featurePanel}
              hidden={!featuresOpen}
              className={styles.featureMenu}
            >
              <div className={styles.featureMenuGroups}>
                {featureGroups.map((group) => (
                  <div key={group.title}>
                    <p className={styles.menuGroupTitle}>{group.title}</p>
                    {group.links.map(([label, description, href]) => (
                      <a href={href} key={href} onClick={close}>
                        <strong>{label}</strong>
                        <span>{description}</span>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
              <a className={styles.menuIntegration} href="#integrations" onClick={close}>
                <span>
                  <strong>Integrations</strong>
                  <span>See what’s built, planned and being explored.</span>
                </span>
                <ArrowUpRight size={19} aria-hidden="true" />
              </a>
            </div>
          </div>
          <a href="#how-it-works" onClick={close}>
            How it works
          </a>
          <a href="#pricing" onClick={close}>
            Pricing
          </a>
          <a href="#about" onClick={close}>
            About
          </a>
          <a href="/app?auth=sign-in" className={styles.mobileSignIn}>
            Sign in <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
        <div className={styles.headerActions}>
          <a href="/app?auth=sign-in" className={styles.desktopSignIn}>
            Sign in
          </a>
          <a href="/app?auth=sign-up" className={styles.headerCta}>
            Get started <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            type="button"
            ref={mobileToggle}
            className={styles.mobileToggle}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-controls="site-navigation"
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setFeaturesOpen(false);
            }}
          >
            {mobileOpen ? (
              <X size={23} aria-hidden="true" />
            ) : (
              <Menu size={23} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
