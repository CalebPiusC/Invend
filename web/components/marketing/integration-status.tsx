'use client';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  FileText,
  Info,
  Pause,
  Play,
  Table2,
  X,
} from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import {
  integrationStatuses,
  type IntegrationDefinition,
  type IntegrationId,
} from './integration-data';
import styles from './integration-status.module.css';

export { integrationStatuses } from './integration-data';

function ToolMark({ tool }: { tool: IntegrationDefinition }) {
  if (tool.logo)
    return <img src={tool.logo} width="32" height="32" alt="" loading="lazy" decoding="async" />;
  if (tool.id === 'assistant') return <BrandIcon size={27} />;
  return tool.id === 'pdf' ? (
    <FileText size={24} strokeWidth={1.5} aria-hidden="true" />
  ) : (
    <Table2 size={24} strokeWidth={1.5} aria-hidden="true" />
  );
}

export function IntegrationMap() {
  const [previewId, setPreviewId] = useState<IntegrationId | null>(null);
  const [pinnedId, setPinnedId] = useState<IntegrationId | null>(null);
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const nodes = useRef<Partial<Record<IntegrationId, HTMLButtonElement | null>>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocus = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const dismissedPointer = useRef<{ x: number; y: number } | null>(null);
  const activeId = pinnedId ?? previewId;
  const active = integrationStatuses.find((tool) => tool.id === activeId);

  function cancelClose() {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }
  function dismiss(restore = false) {
    cancelClose();
    // Removing a panel may expose a node directly under a stationary pointer.
    // That synthetic pointer-enter must not undo an explicit close.
    dismissedPointer.current = { ...lastPointer.current };
    setPreviewId(null);
    setPinnedId(null);
    if (restore && activeId) {
      suppressFocus.current = true;
      nodes.current[activeId]?.focus({ preventScroll: true });
      suppressFocus.current = false;
    }
  }
  function closeLater(closePin = false) {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (root.current?.contains(document.activeElement)) return;
      setPreviewId(null);
      if (closePin) setPinnedId(null);
    }, 180);
  }

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setRevealed(true);
        else {
          setPreviewId(null);
          setPinnedId(null);
        }
      },
      { threshold: 0.12, rootMargin: '50px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    function outside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        panel.current?.contains(target) ||
        (root.current?.contains(target) && target.closest('[data-integration-node]'))
      )
        return;
      setPreviewId(null);
      setPinnedId(null);
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const restore = panel.current?.contains(document.activeElement) ?? false;
      dismissedPointer.current = { ...lastPointer.current };
      setPreviewId(null);
      setPinnedId(null);
      if (restore) {
        suppressFocus.current = true;
        nodes.current[activeId!]?.focus({ preventScroll: true });
        suppressFocus.current = false;
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [activeId]);

  // Keep a nearby desktop panel in the actual viewport, including short windows and zoom.
  // Mobile uses a non-modal bottom sheet so another tool remains selectable.
  useLayoutEffect(() => {
    const element = panel.current;
    const anchor = activeId ? nodes.current[activeId] : null;
    const canvas = element?.parentElement;
    if (!element || !anchor || !canvas) return;
    let frame = 0;
    const properties = ['left', 'right', 'top', 'bottom', 'margin-left', 'max-height'];
    function place() {
      if (!element || !anchor || !canvas) return;
      if (window.matchMedia('(max-width: 699px)').matches) {
        properties.forEach((property) => element.style.removeProperty(property));
        return;
      }
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      const safeTop = Math.max(12, headerBottom + 12);
      element.style.maxHeight = `${Math.max(100, window.innerHeight - safeTop - 12)}px`;
      const target = anchor.getBoundingClientRect();
      const container = canvas.getBoundingClientRect();
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const left = Math.max(
        12,
        Math.min(target.left + target.width / 2 - width / 2, window.innerWidth - width - 12),
      );
      const below = target.bottom + 12;
      const preferred =
        below + height <= window.innerHeight - 12 ? below : target.top - height - 12;
      const top = Math.max(safeTop, Math.min(preferred, window.innerHeight - height - 12));
      element.style.left = `${left - container.left}px`;
      element.style.top = `${top - container.top}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      element.style.marginLeft = '0';
    }
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [activeId, pinnedId]);

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      next = (index + 1) % integrationStatuses.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (index + integrationStatuses.length - 1) % integrationStatuses.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = integrationStatuses.length - 1;
    else return;
    event.preventDefault();
    setPinnedId(null);
    setPreviewId(integrationStatuses[next].id);
    nodes.current[integrationStatuses[next].id]?.focus();
  }
  function change(direction: number) {
    const index = integrationStatuses.findIndex((tool) => tool.id === activeId);
    const next =
      integrationStatuses[
        (index + direction + integrationStatuses.length) % integrationStatuses.length
      ];
    setPreviewId(null);
    setPinnedId(next.id);
  }

  return (
    <figure
      ref={root}
      className={styles.map}
      data-testid="integration-map"
      data-active={activeId ?? ''}
      data-motion={visible && !paused ? 'playing' : 'paused'}
      data-revealed={revealed}
      aria-label="Explore Invend’s channels, companion and portable files"
      onBlurCapture={(event) => {
        // A definite keyboard destination outside the figure must dismiss immediately;
        // pointer movement over an exposed panel must not cancel that focus handoff.
        if (event.relatedTarget instanceof Node) {
          if (!event.currentTarget.contains(event.relatedTarget)) dismiss();
        } else closeLater(true);
      }}
      onPointerMoveCapture={(event) => {
        if (event.pointerType === 'mouse')
          lastPointer.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <div className={styles.mapCanvas}>
        <svg
          className={styles.connectors}
          viewBox="0 0 1100 560"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {integrationStatuses.map((tool) => (
            <path
              key={tool.id}
              d={tool.path}
              className={`${styles.connection} ${tool.group !== 'channel' ? styles.secondaryConnection : ''}`}
              data-selected={activeId === tool.id}
              data-route={tool.id}
            />
          ))}
          {integrationStatuses.slice(0, 2).map((tool, index) => (
            <circle
              key={tool.id}
              r="2.7"
              className={styles.traveller}
              style={{ offsetPath: `path('${tool.path}')`, animationDelay: `${index * -4}s` }}
            />
          ))}
        </svg>
        <svg
          className={styles.mobileConnectors}
          viewBox="0 0 600 586"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path d="M150 54V110Q150 141 200 141H250Q300 141 300 195M450 54V110Q450 141 400 141H350Q300 141 300 195M150 336V278Q150 250 204 250H250Q300 250 300 195M450 336V278Q450 250 396 250H350Q300 250 300 195" />
          <path
            d="M300 195V446M150 547V510Q150 486 200 486H250Q300 486 300 446M450 547V510Q450 486 400 486H350Q300 486 300 446"
            strokeDasharray="3 6"
          />
        </svg>
        <div className={styles.hub}>
          <BrandIcon size={53} />
          <strong>Invend</strong>
          <span>Your workspace</span>
        </div>
        {integrationStatuses.map((tool, index) => (
          <button
            key={tool.id}
            type="button"
            ref={(element) => {
              nodes.current[tool.id] = element;
            }}
            className={`${styles.node} ${styles[tool.id]}`}
            data-integration-node={tool.id}
            data-group={tool.group}
            data-selected={activeId === tool.id}
            style={{ animationDelay: `${index * 55}ms` }}
            aria-expanded={activeId === tool.id}
            aria-pressed={pinnedId === tool.id}
            aria-controls={activeId === tool.id ? 'integration-info' : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'mouse' || dismissedPointer.current) return;
              cancelClose();
              if (!pinnedId) setPreviewId(tool.id);
            }}
            onPointerMove={(event) => {
              if (event.pointerType !== 'mouse') return;
              const previous = dismissedPointer.current;
              if (
                previous &&
                Math.abs(previous.x - event.clientX) + Math.abs(previous.y - event.clientY) < 4
              )
                return;
              dismissedPointer.current = null;
              cancelClose();
              if (!pinnedId) setPreviewId(tool.id);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') closeLater();
            }}
            onFocus={() => {
              cancelClose();
              if (suppressFocus.current) return;
              if (pinnedId && pinnedId !== tool.id) setPinnedId(null);
              setPreviewId(tool.id);
            }}
            onClick={() => {
              if (pinnedId === tool.id) {
                dismiss();
                return;
              }
              cancelClose();
              setPreviewId(null);
              setPinnedId(tool.id);
            }}
            onKeyDown={(event) => move(event, index)}
          >
            <span className={styles.nodeMark}>
              <ToolMark tool={tool} />
            </span>
            <span className={styles.nodeText}>
              <strong>{tool.shortName}</strong>
              <span>{tool.label}</span>
              <small data-status={tool.status}>{tool.status}</small>
            </span>
            <span className={styles.nodeHint} aria-hidden="true">
              +
            </span>
          </button>
        ))}
        {active && (
          <div
            ref={panel}
            id="integration-info"
            role="region"
            aria-labelledby="integration-info-title"
            className={styles.infoPanel}
            data-for={active.id}
            data-pinned={Boolean(pinnedId)}
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') closeLater();
            }}
            onFocusCapture={cancelClose}
          >
            <div className={styles.infoTop}>
              <span className={styles.infoMark}>
                <ToolMark tool={active} />
              </span>
              <div>
                <span className={styles.groupName}>
                  {active.group === 'channel'
                    ? 'Customer channel'
                    : active.group === 'companion'
                      ? 'Your separate companion'
                      : 'Portable file format'}
                </span>
                <h3 id="integration-info-title">{active.name}</h3>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => dismiss(true)}
                aria-label="Close tool details"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.infoStatus}>
              <span data-status={active.status}>{active.status}</span>
              <small>{active.priority}</small>
            </div>
            <p className={styles.purpose}>{active.purpose}</p>
            <p className={styles.readinessNote}>{active.readiness}</p>
            {pinnedId ? (
              <div className={styles.panelControls}>
                <span>Select another tool to switch</span>
                <button type="button" aria-label="Previous tool" onClick={() => change(-1)}>
                  <ArrowLeft size={15} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next tool" onClick={() => change(1)}>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <p className={styles.pinHint}>Click or press Enter to keep these details open.</p>
            )}
          </div>
        )}
      </div>
      <figcaption className={styles.mapCaption}>
        <span>
          <Info size={13} aria-hidden="true" /> A roadmap, not live connections. Select a tool to
          explore.
        </span>
        <button
          type="button"
          className={styles.motionToggle}
          aria-pressed={paused}
          aria-label={paused ? 'Resume diagram animation' : 'Pause diagram animation'}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {paused ? 'Resume diagram animation' : 'Pause diagram animation'}
        </button>
      </figcaption>
      <span className={styles.srOnly} role="status">
        {pinnedId && active
          ? `${active.name}. ${active.status}. Details pinned. Select another tool to change or Escape to close.`
          : ''}
      </span>
    </figure>
  );
}

export function IntegrationStatus() {
  return (
    <details id="integration-readiness" className={styles.readiness}>
      <summary>
        <strong>Integration readiness</strong>
        <span>What’s available, what comes next, and what’s a download.</span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className={styles.statusList} data-testid="integration-status">
        <ul>
          {integrationStatuses.map((tool) => (
            <li key={tool.id}>
              <div className={styles.channel}>
                <span className={styles.listMark}>
                  <ToolMark tool={tool} />
                </span>
                <div>
                  <strong>{tool.name}</strong>
                  <span>{tool.priority}</span>
                </div>
              </div>
              <span className={styles.listStatus} data-status={tool.status}>
                {tool.status}
              </span>
              <p>{tool.readiness}</p>
            </li>
          ))}
        </ul>
        <p className={styles.disclosure}>
          No live provider connection is demonstrated here. Preview conversations are fictional,
          including those for planned channels. TikTok messaging remains research-only; handle those
          conversations outside Invend. SMS is exploratory and unsupported. Neither is a promised
          channel in this rollout.
        </p>
      </div>
    </details>
  );
}

export function InteractiveIntegrations() {
  return (
    <section id="integrations" className={styles.section} aria-labelledby="integrations-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>CONNECTED, ON YOUR TERMS</p>
          <h2 id="integrations-title">
            Your business tools,
            <br />
            finally working together.
          </h2>
          <p className={styles.description}>
            Bring customer conversations into Invend, keep business operations connected, and take
            your important information wherever you need it.
          </p>
        </div>
        <IntegrationMap />
        <IntegrationStatus />
        <div className={styles.transition}>
          <p>
            More than connected conversations.
            <br />
            <span>A better way to run your business.</span>
          </p>
          <a href="#features">
            Explore your workspace <ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
