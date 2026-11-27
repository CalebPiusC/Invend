import {
  ChevronDown,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  MessageSquare,
  Music2,
} from 'lucide-react';
import { BrandIcon } from '../brand-icon';
import type { Channel } from '../../lib/data';
import styles from './integration-status.module.css';

// Priorities are product direction, not provider approval or live availability.
// Gmail: api/app/pipeline + channels/gmail; WhatsApp: api/app/whatsapp.
export const integrationStatuses: ReadonlyArray<{
  name: string;
  channel: Channel | 'sms';
  priority: string;
  status: string;
  note: string;
}> = [
  {
    name: 'Gmail / Email',
    channel: 'email',
    priority: '01 / First priority',
    status: 'Built · live validation pending',
    note: 'Gmail OAuth and the message pipeline exist. Google configuration and authorised live acceptance remain pending.',
  },
  {
    name: 'WhatsApp',
    channel: 'whatsapp',
    priority: '02 / Next priority',
    status: 'Built · live validation pending',
    note: 'Implementation and sandbox flow exist. Meta approval and real delivery acceptance remain pending.',
  },
  {
    name: 'Instagram',
    channel: 'instagram',
    priority: 'Later',
    status: 'Planned',
    note: 'A sample inbox entry is not a live connection. Messaging implementation and Meta review are still required.',
  },
  {
    name: 'Facebook Messenger',
    channel: 'facebook',
    priority: 'Later',
    status: 'Planned',
    note: 'Planned for the unified workspace. No live Messenger integration is claimed in this build.',
  },
  {
    name: 'TikTok',
    channel: 'tiktok',
    priority: 'Research',
    status: 'Under review',
    note: 'Access and messaging scope are still being researched. Connection availability is not promised.',
  },
  {
    name: 'SMS',
    channel: 'sms',
    priority: 'Exploratory',
    status: 'Exploring · not supported',
    note: 'An integration to investigate. No SMS provider, connection or message delivery is available here.',
  },
];
const icons = {
  email: Mail,
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  sms: MessageSquare,
};

export function IntegrationMap() {
  return (
    <figure
      className={styles.map}
      aria-label="Invend integration roadmap: Gmail first, WhatsApp second, Instagram and Facebook later"
      data-testid="integration-map"
    >
      <div className={styles.mapCanvas}>
        <svg
          className={styles.connectors}
          viewBox="0 0 600 300"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path d="M160 65C220 65 213 150 250 150M160 235C220 235 213 150 250 150" />
          <path
            d="M350 150C390 150 382 65 440 65M350 150C390 150 382 235 440 235"
            strokeDasharray="5 5"
          />
        </svg>
        {integrationStatuses.slice(0, 4).map((integration, index) => {
          const Icon = icons[integration.channel];
          return (
            <div key={integration.channel} className={`${styles.node} ${styles[`node${index}`]}`}>
              <div>
                <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                <strong>
                  {integration.channel === 'email'
                    ? 'Gmail'
                    : integration.channel === 'facebook'
                      ? 'Facebook'
                      : integration.name}
                </strong>
              </div>
              <span>{integration.priority}</span>
              <small>{index < 2 ? 'Live validation pending' : 'Planned · not available'}</small>
            </div>
          );
        })}
        <div className={styles.hub}>
          <BrandIcon size={48} />
          <strong>invend</strong>
        </div>
      </div>
      <figcaption>Integration roadmap. These lines do not represent live connections.</figcaption>
    </figure>
  );
}

export function IntegrationStatus() {
  return (
    <details id="integration-readiness" className={styles.readiness}>
      <summary>
        <strong>Integration readiness</strong>
        <span>What’s built, what comes next, and what isn’t available yet.</span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className={styles.statusList} data-testid="integration-status">
        <ul>
          {integrationStatuses.map((integration) => {
            const Icon = icons[integration.channel];
            return (
              <li key={integration.channel}>
                <div className={styles.channel}>
                  <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <strong>{integration.name}</strong>
                    <span>{integration.priority}</span>
                  </div>
                </div>
                <span className={styles.status}>{integration.status}</span>
                <p>{integration.note}</p>
              </li>
            );
          })}
        </ul>
        <p className={styles.disclosure}>
          No live provider connection is demonstrated on this page. Preview conversations are
          fictional, including those for planned channels.
        </p>
      </div>
    </details>
  );
}
