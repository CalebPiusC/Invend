'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Check, LoaderCircle, Share2, Smartphone, X } from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import type { InstallEvent } from '../../lib/workspace-types';
import { installInstructions, type InstallInstructions } from '../../lib/pwa-install';
import styles from './hero-install.module.css';

const installedDisplay =
  '(display-mode: standalone), (display-mode: minimal-ui), (display-mode: window-controls-overlay)';

export function HeroInstall() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [instructions, setInstructions] = useState<InstallInstructions>(() =>
    installInstructions(''),
  );
  const prompt = useRef<InstallEvent | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const display = window.matchMedia(installedDisplay);
    const updateInstalled = () => {
      const isInstalled =
        display.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(isInstalled);
      if (isInstalled) {
        prompt.current = null;
        setOpen(false);
      }
    };
    const capture = (event: Event) => {
      event.preventDefault();
      prompt.current = event as InstallEvent;
    };
    const finish = () => {
      prompt.current = null;
      setInstalled(true);
      setOpen(false);
      setNotice('Invend was installed by your browser.');
    };
    updateInstalled();
    setInstructions(installInstructions(navigator.userAgent, navigator.maxTouchPoints));
    setReady(true);
    display.addEventListener('change', updateInstalled);
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', finish);
    // Reuse the existing worker/manifest. Never cache marketing illustrations or private data here.
    if (window.isSecureContext && 'serviceWorker' in navigator)
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installation is browser-dependent; the manual guidance remains usable on failure.
      });
    return () => {
      alive.current = false;
      display.removeEventListener('change', updateInstalled);
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', finish);
      prompt.current = null;
    };
  }, []);

  useEffect(() => {
    const panel = dialog.current;
    if (!open || !panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.showModal();
    panel.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      panel.close();
      document.body.style.overflow = previousOverflow;
      (
        trigger.current ?? document.querySelector<HTMLAnchorElement>('#home [data-primary-cta]')
      )?.focus({ preventScroll: true });
    };
  }, [open]);

  async function install() {
    const deferred = prompt.current;
    setNotice('');
    if (!deferred) {
      setOpen(true);
      return;
    }
    prompt.current = null; // A native install event is single-use.
    setBusy(true);
    try {
      await deferred.prompt(); // Called directly from the user's activation, not on page load.
      const choice = await deferred.userChoice;
      if (!alive.current) return;
      setNotice(
        choice.outcome === 'accepted'
          ? 'Installation requested. Follow your browser to finish.'
          : 'Installation was dismissed. You can return to these options whenever you like.',
      );
      // An accepted prompt is not proof of installation; appinstalled/display-mode owns that state.
    } catch {
      if (!alive.current) return;
      setNotice('Your browser could not open the install prompt. You can use its menu instead.');
      setOpen(true);
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  return (
    <>
      {!installed && (
        <span className={styles.installSlot} data-pwa-control>
          <button
            type="button"
            ref={trigger}
            hidden={!ready}
            className={styles.installButton}
            aria-label={busy ? 'Opening installation prompt' : 'Install Invend'}
            aria-describedby="invend-install-tooltip"
            aria-haspopup="dialog"
            aria-expanded={open}
            disabled={busy}
            onClick={() => void install()}
          >
            {busy ? (
              <LoaderCircle size={19} className={styles.spinner} aria-hidden="true" />
            ) : (
              <ArrowDownToLine size={19} strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>
          <span id="invend-install-tooltip" role="tooltip" className={styles.tooltip}>
            Your business, on your home screen. Install Invend on this device, or open it in your
            phone’s browser to add it there.
          </span>
        </span>
      )}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {notice}
      </span>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="install-dialog-title"
        aria-describedby="install-web-app-note"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
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
            setOpen(false);
        }}
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
      >
        <div className={styles.dialogTop}>
          <span className={styles.appSymbol}>
            <BrandIcon size={32} />
          </span>
          <button
            type="button"
            aria-label="Close installation instructions"
            className={styles.close}
            onClick={() => setOpen(false)}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        <p className={styles.platform}>{instructions.platform}</p>
        <h2 id="install-dialog-title">{instructions.title}</h2>
        <p id="install-web-app-note" className={styles.intro}>
          The same Invend workspace, one tap away. An installed web app—not a native Android or iOS
          app.
        </p>
        {notice && <p className={styles.notice}>{notice}</p>}
        <ol className={styles.steps}>
          {instructions.steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <p className={styles.note}>{instructions.note}</p>
        {!['iPhone or iPad', 'Android'].includes(instructions.platform) && (
          <details className={styles.phoneHelp}>
            <summary>
              <Smartphone size={16} aria-hidden="true" /> Looking to install on your phone?
            </summary>
            <div>
              <p>
                <strong>iPhone / iPad</strong> Open Invend in Safari, then{' '}
                <Share2 size={13} aria-hidden="true" /> Share → Add to Home Screen.
              </p>
              <p>
                <strong>Android</strong> Open Invend in your browser and use its menu → Install app
                or Add to Home screen.
              </p>
            </div>
          </details>
        )}
        <p className={styles.onlineNote}>
          An internet connection is still required for your business workspace. Customer data is not
          cached for offline use.
        </p>
        <button type="button" className={styles.done} onClick={() => setOpen(false)}>
          Got it <Check size={16} aria-hidden="true" />
        </button>
      </dialog>
    </>
  );
}
