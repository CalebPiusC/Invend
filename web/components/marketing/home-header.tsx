'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './brand';
import styles from './homepage.module.css';

const links = [
  ['Features', '#features'],
  ['How it works', '#how-it-works'],
  ['Your control', '#your-control'],
] as const;

export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    const desktop = window.matchMedia('(min-width: 900px)');
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', resize);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', resize);
    };
  }, [open]);

  return (
    <header className={styles.header} ref={header}>
      <div className={styles.headerInner}>
        <a href="/" aria-label="Selvora home" className={styles.brandLink}>
          <Brand />
        </a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <a href="/app?auth=sign-in" className={styles.signIn}>
            Sign in
          </a>
          <a href="/app?auth=sign-up" className={styles.headerCta}>
            Get started <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <button
            ref={toggle}
            type="button"
            className={styles.menuToggle}
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav
        id="public-mobile-menu"
        className={styles.mobileNav}
        aria-label="Mobile site navigation"
        hidden={!open}
      >
        {links.map(([label, href]) => (
          <a href={href} key={href} onClick={() => setOpen(false)}>
            {label}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
        <a href="/app?auth=sign-in">
          Sign in <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <a href="/app">
          Explore the sample workspace <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
