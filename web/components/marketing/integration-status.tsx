import { MessageSquare } from 'lucide-react';
import { ChannelIcon } from '../inbox/channel-icon';
import type { Channel } from '../../lib/data';
import styles from './integration-status.module.css';

// Status is based on the implementations in this repository, not provider approval.
// Gmail: api/app/pipeline + channels/gmail; WhatsApp: api/app/whatsapp.
// The remaining channels have no production messaging adapter in this build.
export const integrationStatuses: ReadonlyArray<{
  name: string;
  channel: Channel | 'sms';
  status: string;
  note: string;
}> = [
  {
    name: 'WhatsApp',
    channel: 'whatsapp',
    status: 'Built · live validation pending',
    note: 'Implementation and sandbox flow exist. Meta approval and real delivery acceptance remain pending.',
  },
  {
    name: 'Instagram',
    channel: 'instagram',
    status: 'Planned',
    note: 'A sample inbox entry is not a live connection. Messaging implementation and Meta review are still required.',
  },
  {
    name: 'Facebook Messenger',
    channel: 'facebook',
    status: 'Planned',
    note: 'Planned for the unified workspace; no live Messenger integration is claimed in this build.',
  },
  {
    name: 'Gmail / Email',
    channel: 'email',
    status: 'Built · live validation pending',
    note: 'Gmail OAuth and message-pipeline code exist. Google configuration and authorised live acceptance remain pending.',
  },
  {
    name: 'TikTok',
    channel: 'tiktok',
    status: 'Under review',
    note: 'Access and messaging scope are still being researched. Connection availability is not promised.',
  },
  {
    name: 'SMS',
    channel: 'sms',
    status: 'Exploring · not supported',
    note: 'An integration to investigate. No SMS provider, connection or message delivery is available here.',
  },
];

export function IntegrationStatus() {
  return (
    <div className={styles.statusList} data-testid="integration-status">
      <div className={styles.columnHead} aria-hidden="true">
        <span>CHANNEL</span>
        <span>STATUS IN THIS BUILD</span>
        <span>WHAT THAT MEANS</span>
      </div>
      <ul>
        {integrationStatuses.map((integration) => (
          <li key={integration.channel}>
            <div className={styles.channel}>
              <span aria-hidden="true">
                {integration.channel === 'sms' ? (
                  <span className={styles.smsIcon}>
                    <MessageSquare size={18} />
                  </span>
                ) : (
                  <ChannelIcon channel={integration.channel} />
                )}
              </span>
              <strong>{integration.name}</strong>
            </div>
            <span className={styles.status}>{integration.status}</span>
            <p>{integration.note}</p>
          </li>
        ))}
      </ul>
      <p className={styles.disclosure}>
        No live provider connection is demonstrated on this page. Preview conversations are
        fictional, including those for planned channels.
      </p>
    </div>
  );
}
