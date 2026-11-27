'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { Brand } from './brand';
import { FeatureMegaMenu } from './feature-mega-menu';
import {
  navigationFeatures,
  navigationFeatureGroups,
  featureDestination,
} from './feature-navigation';
import styles from './home-header.module.css';

export const homeNavigation = [
  ['Home', '#home'],
  ['Features', '#features'],
  ['How it works', '#how-it-works'],
  ['Pricing', '#pricing'],
  ['About', '#about'],
  ['Sign in', '/app?auth=sign-in'],
  ['Get started', '/app?auth=sign-up'],
] as const;

type MenuMode = 'pointer' | 'click' | null;

export function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMode, setMegaMode] = useState<MenuMode>(null);
  const [megaPresent, setMegaPresent] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('#home');
  const header = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLSpanElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const mobileFeatures = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const featuresToggle = useRef<HTMLButtonElement>(null);
  const mega = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusFrame = useRef(0);
  const menuFocusFrame = useRef(0);
  const desktopHadFocus = useRef(false);
  const mobileDestination = useRef<string | null>(null);
  const megaOpen = megaMode !== null;

  const cancelHoverClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }, []);

  const closeMega = useCallback(
    (restoreFocus = false) => {
      cancelHoverClose();
      cancelAnimationFrame(menuFocusFrame.current);
      setMegaMode(null);
      if (restoreFocus) featuresToggle.current?.focus({ preventScroll: true });
    },
    [cancelHoverClose],
  );

  const openMega = (mode: Exclude<MenuMode, null>, focus?: 'first' | 'last') => {
    cancelHoverClose();
    setMegaPresent(true);
    setMegaMode((previous) => (previous === 'click' && mode === 'pointer' ? previous : mode));
    if (focus) {
      cancelAnimationFrame(menuFocusFrame.current);
      menuFocusFrame.current = requestAnimationFrame(() => {
        const links = mega.current?.querySelectorAll<HTMLAnchorElement>('[data-feature-link]');
        links?.[focus === 'last' ? links.length - 1 : 0]?.focus();
      });
    }
  };

  const scheduleHoverClose = () => {
    cancelHoverClose();
    if (megaMode !== 'pointer' || mega.current?.contains(document.activeElement)) return;
    closeTimer.current = setTimeout(() => closeMega(), 220);
  };

  useEffect(() => {
    if (megaOpen || !megaPresent) return;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
    const timer = setTimeout(() => setMegaPresent(false), duration);
    return () => clearTimeout(timer);
  }, [megaOpen, megaPresent]);

  useEffect(() => {
    if (!megaOpen) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !mega.current?.contains(event.target) &&
        !featuresToggle.current?.contains(event.target)
      )
        closeMega(Boolean(mega.current?.contains(document.activeElement)));
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeMega(true);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [megaOpen, closeMega]);

  useEffect(() => {
    document.documentElement.dataset.marketing = 'true';
    const desktop = window.matchMedia('(min-width: 1100px)');
    const changeLayout = () => {
      cancelHoverClose();
      cancelAnimationFrame(menuFocusFrame.current);
      if (desktop.matches) setMobileOpen(false);
      else {
        // CSS can hide a focused desktop control before the media-query event fires.
        // Remember keyboard ownership instead of relying only on document.activeElement.
        const hadFocus = desktopHadFocus.current;
        desktopHadFocus.current = false;
        setMegaMode(null);
        setMegaPresent(false);
        if (hadFocus) {
          cancelAnimationFrame(focusFrame.current);
          focusFrame.current = requestAnimationFrame(() => toggle.current?.focus());
        }
      }
    };
    desktop.addEventListener('change', changeLayout);
    const sections = homeNavigation
      .filter(([, href]) => href.startsWith('#'))
      .map(([, href]) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section));
    const updateActive = () => {
      let current = '#home';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.35)
          current = `#${section.id}`;
      }
      setActive(current);
    };
    // A document-position sentinel, not a scroll listener: clear at the top, compact after 24px.
    const topObserver = new IntersectionObserver(
      ([entry]) => setSolid(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    if (sentinel.current) topObserver.observe(sentinel.current);
    let sectionObserver: IntersectionObserver;
    let resizeFrame = 0;
    const observeSections = () => {
      sectionObserver?.disconnect();
      sectionObserver = new IntersectionObserver(updateActive, {
        rootMargin: `-${Math.round(window.innerHeight * 0.2)}px 0px -${Math.round(window.innerHeight * 0.65)}px 0px`,
        threshold: 0,
      });
      // Intervening sections matter when the user jumps directly from the footer to the hero/laptop.
      document
        .querySelectorAll('#main-content > section')
        .forEach((section) => sectionObserver.observe(section));
      updateActive();
    };
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(observeSections);
    };
    observeSections();
    window.addEventListener('resize', onResize);
    return () => {
      delete document.documentElement.dataset.marketing;
      desktop.removeEventListener('change', changeLayout);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(focusFrame.current);
      cancelAnimationFrame(menuFocusFrame.current);
      cancelHoverClose();
      topObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [cancelHoverClose]);

  useEffect(() => {
    const panel = dialog.current;
    if (!mobileOpen || !panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.showModal();
    panel.querySelector<HTMLAnchorElement>('nav a')?.focus();
    return () => {
      panel.close();
      document.body.style.overflow = previousOverflow;
      mobileFeatures.current?.removeAttribute('open');
      if (!mobileDestination.current) {
        // On a breakpoint change the mobile toggle is hidden. Restore focus only after
        // closing the native modal, when desktop controls are no longer inert.
        const target = window.matchMedia('(min-width: 1100px)').matches ? featuresToggle : toggle;
        target.current?.focus({ preventScroll: true });
      }
      mobileDestination.current = null;
    };
  }, [mobileOpen]);

  const navigate = (href: string) => {
    mobileDestination.current = href;
    setMobileOpen(false);
    closeMega();
    if (!href.startsWith('#')) return;
    if (homeNavigation.some(([, destination]) => destination === href)) setActive(href);
    // A repeated link must still select its panel if the tour was changed without changing the URL.
    if (window.location.hash === href) window.dispatchEvent(new HashChangeEvent('hashchange'));
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(href)?.focus({ preventScroll: true });
    });
  };

  const accountLinks = (
    <>
      <a
        href="/app?auth=sign-in"
        className={styles.signIn}
        onFocus={() => closeMega()}
        onClick={() => navigate('/app?auth=sign-in')}
      >
        Sign in
      </a>
      <a
        href="/app?auth=sign-up"
        className={styles.getStarted}
        onFocus={() => closeMega()}
        onClick={() => navigate('/app?auth=sign-up')}
      >
        Get started <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </>
  );

  return (
    <>
      <span ref={sentinel} className={styles.scrollSentinel} aria-hidden="true" />
      <header
        ref={header}
        className={styles.header}
        data-solid={solid}
        data-mega-open={megaOpen}
        onFocusCapture={(event) => {
          const navigation = event.target.closest('nav')?.getAttribute('aria-label');
          desktopHadFocus.current =
            navigation === 'Main navigation' ||
            navigation === 'Account navigation' ||
            Boolean(mega.current?.contains(event.target));
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            // A hidden control emits blur with no related target during a breakpoint change.
            if (event.relatedTarget || window.matchMedia('(min-width: 1100px)').matches)
              desktopHadFocus.current = false;
            closeMega();
          }
        }}
      >
        <div className={styles.bar} data-testid="navigation-pill">
          <a
            href="#home"
            aria-label="Invend home"
            className={styles.brandLink}
            onClick={() => navigate('#home')}
          >
            <Brand wordmark="Invend" className={styles.navBrand} />
          </a>
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {homeNavigation.slice(0, 5).map(([label, href]) =>
              label === 'Features' ? (
                <button
                  key={href}
                  type="button"
                  ref={featuresToggle}
                  id="features-navigation-trigger"
                  className={styles.navLink}
                  aria-controls="features-mega-menu"
                  aria-expanded={megaOpen}
                  aria-current={active === href ? 'location' : undefined}
                  onPointerEnter={(event) => {
                    if (
                      event.pointerType !== 'touch' &&
                      window.matchMedia('(hover: hover)').matches
                    )
                      openMega('pointer');
                  }}
                  onPointerLeave={scheduleHoverClose}
                  onClick={(event) => {
                    if (megaMode === 'click') closeMega();
                    else openMega('click', event.detail === 0 ? 'first' : undefined);
                  }}
                  onKeyDown={(event) => {
                    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                      event.preventDefault();
                      openMega('click', event.key === 'ArrowUp' ? 'last' : 'first');
                    } else if (event.key === 'Tab' && !event.shiftKey && megaOpen) {
                      event.preventDefault();
                      openMega('click', 'first');
                    }
                  }}
                >
                  Features <ChevronDown size={13} aria-hidden="true" />
                </button>
              ) : (
                <a
                  href={href}
                  key={href}
                  className={styles.navLink}
                  aria-current={active === href ? 'location' : undefined}
                  onFocus={() => closeMega()}
                  onClick={() => navigate(href)}
                >
                  {label}
                </a>
              ),
            )}
          </nav>
          <nav className={styles.accountActions} aria-label="Account navigation">
            {accountLinks}
          </nav>
          <button
            type="button"
            ref={toggle}
            className={styles.mobileToggle}
            aria-label="Open navigation"
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
            onClick={() => {
              mobileDestination.current = null;
              setMobileOpen(true);
            }}
          >
            <Menu size={22} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
        <div
          id="features-mega-menu"
          ref={mega}
          className={styles.megaShell}
          role="region"
          aria-label="Explore Invend features"
          hidden={!megaPresent}
          aria-hidden={!megaOpen}
          inert={!megaOpen}
          data-open={megaOpen}
          onPointerEnter={cancelHoverClose}
          onPointerLeave={scheduleHoverClose}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return;
            const links = event.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href]');
            // Visually this panel follows Features. Preserve that logical tab order even
            // though its full-width shell sits after the three-zone bar in the DOM.
            if (event.shiftKey && document.activeElement === links[0]) {
              event.preventDefault();
              closeMega(true);
            } else if (!event.shiftKey && document.activeElement === links[links.length - 1]) {
              event.preventDefault();
              header.current
                ?.querySelector<HTMLAnchorElement>('nav a[href="#how-it-works"]')
                ?.focus();
            }
          }}
        >
          <FeatureMegaMenu onNavigate={navigate} />
        </div>
        <dialog
          id="mobile-navigation"
          ref={dialog}
          className={styles.mobileDialog}
          aria-label="Site navigation"
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return;
            const controls = event.currentTarget.querySelectorAll<HTMLElement>(
              'button, a[href], summary',
            );
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          onCancel={(event) => {
            event.preventDefault();
            setMobileOpen(false);
          }}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              setMobileOpen(false);
          }}
        >
          <div className={styles.mobileContent}>
            <div className={styles.dialogHeader}>
              <Brand wordmark="Invend" className={styles.navBrand} />
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X size={22} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile navigation" className={styles.mobileNav}>
              <div className={styles.mobileLinks}>
                <p className={styles.mobileEyebrow}>YOUR BUSINESS, MORE CONNECTED.</p>
                {homeNavigation.slice(0, 5).map(([label, href]) =>
                  label === 'Features' ? (
                    <details ref={mobileFeatures} key={href} className={styles.mobileFeatures}>
                      <summary aria-current={active === href ? 'location' : undefined}>
                        Features <ChevronDown size={18} aria-hidden="true" />
                      </summary>
                      <div className={styles.mobileFeatureGroups}>
                        <a
                          href="#features"
                          className={styles.allFeatures}
                          onClick={() => navigate('#features')}
                        >
                          Explore all features <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                        {navigationFeatureGroups.map((group) => (
                          <div className={styles.mobileCategory} key={group.name}>
                            <h2>{group.name}</h2>
                            {group.indexes.map((index) => {
                              const item = navigationFeatures[index];
                              return (
                                <a
                                  href={featureDestination(item)}
                                  key={item.key}
                                  onClick={() => navigate(featureDestination(item))}
                                >
                                  <item.icon size={18} strokeWidth={1.65} aria-hidden="true" />
                                  <span>
                                    <strong>{item.name}</strong>
                                    <small>{item.description}</small>
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        ))}
                        <p className={styles.mobileDisclaimer}>
                          Product examples, not live connections.
                        </p>
                      </div>
                    </details>
                  ) : (
                    <a
                      href={href}
                      key={href}
                      className={styles.mobileLink}
                      aria-current={active === href ? 'location' : undefined}
                      onClick={() => navigate(href)}
                    >
                      {label}
                    </a>
                  ),
                )}
              </div>
              <div className={styles.mobileAccounts}>{accountLinks}</div>
            </nav>
            <p className={styles.drawerNote}>Your conversations. Your decisions.</p>
          </div>
        </dialog>
      </header>
    </>
  );
}
