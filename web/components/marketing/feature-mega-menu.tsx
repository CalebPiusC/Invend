'use client';
import { useState, type KeyboardEvent } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  navigationFeatures,
  navigationFeatureGroups,
  featureDestination,
} from './feature-navigation';
import { NavigationPreview } from './navigation-preview';
import styles from './home-header.module.css';

export function FeatureMegaMenu({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [selected, setSelected] = useState(0);
  const feature = navigationFeatures[selected];
  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const links = [
      ...event.currentTarget.querySelectorAll<HTMLAnchorElement>('[data-feature-link]'),
    ];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) return;
    let next: number;
    if (event.key === 'ArrowDown') next = (index + 1) % links.length;
    else if (event.key === 'ArrowUp') next = (index + links.length - 1) % links.length;
    else if (event.key === 'ArrowRight') next = (index + 2) % links.length;
    else if (event.key === 'ArrowLeft') next = (index + links.length - 2) % links.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else return;
    event.preventDefault();
    links[next]?.focus();
  };

  return (
    <div className={styles.megaPanel}>
      <div className={styles.megaMain}>
        <div className={styles.megaHeading}>
          <span>LESS BACK-AND-FORTH. MORE CLARITY.</span>
          <span>Explore Invend</span>
        </div>
        <div className={styles.featureGrid} onKeyDown={moveFocus}>
          {navigationFeatureGroups.map((group) => (
            <div className={styles.featureCategory} key={group.name}>
              <h2>{group.name}</h2>
              <ul>
                {group.indexes.map((index) => {
                  const item = navigationFeatures[index];
                  return (
                    <li key={item.key}>
                      <a
                        href={featureDestination(item)}
                        data-feature-link={item.key}
                        data-preview={selected === index}
                        className={styles.featureLink}
                        onPointerEnter={() => setSelected(index)}
                        onFocus={() => setSelected(index)}
                        onClick={() => onNavigate(featureDestination(item))}
                      >
                        <span className={styles.featureIcon}>
                          <item.icon size={19} strokeWidth={1.65} aria-hidden="true" />
                        </span>
                        <span>
                          <strong>{item.name}</strong>
                          <span>{item.description}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.megaFoot}>
          <a href="#features" onClick={() => onNavigate('#features')}>
            See all features <ArrowRight size={15} aria-hidden="true" />
          </a>
          <span>Product examples. No live connections.</span>
        </div>
      </div>
      <aside className={styles.previewAside} aria-label="Feature preview">
        <div className={styles.previewHeader}>
          <span>IN THE WORKSPACE</span>
          <span className={styles.previewDot} />
        </div>
        <div
          className={styles.previewScene}
          key={feature.key}
          data-preview-feature={feature.key}
          aria-hidden="true"
        >
          <NavigationPreview feature={feature.key} />
        </div>
        <div className={styles.previewCaption} aria-live="polite" aria-atomic="true">
          <span>Fictional product example</span>
          <p>{feature.readiness}</p>
        </div>
        <a
          href={featureDestination(feature)}
          className={styles.previewLink}
          onClick={() => onNavigate(featureDestination(feature))}
        >
          Explore this feature <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </aside>
    </div>
  );
}
