import { Plus } from 'lucide-react';
import {
  CatalogueDemo,
  HumanControlDemo,
  InboxDemo,
  LeadDemo,
  NegotiationDemo,
  OrderJourney,
} from './product-walkthrough';
import styles from './workflow-explorer.module.css';

const workflows = [
  {
    id: 'negotiation',
    title: 'A helpful reply. A firm price boundary.',
    note: 'Business facts and minimum prices come before the wording.',
    Demo: NegotiationDemo,
  },
  {
    id: 'smart-catalogue',
    title: 'A photo first. The facts confirmed.',
    note: 'Review products, prices and stock before anything is published.',
    Demo: CatalogueDemo,
  },
  {
    id: 'unified-inbox',
    title: 'The customer. The whole conversation.',
    note: 'Keep the product, the question and the next step in view.',
    Demo: InboxDemo,
  },
  {
    id: 'lead-management',
    title: 'An enquiry worth following up.',
    note: 'Continue with context and consent, not another generic message.',
    Demo: LeadDemo,
  },
  {
    id: 'orders-and-payments',
    title: 'From conversation to a proper order.',
    note: 'A draft, verified vendor payment and a read-only receipt.',
    Demo: OrderJourney,
  },
  {
    id: 'team-management',
    title: 'An extra pair of hands. Your final say.',
    note: 'Human takeover, reviewed replies and clear staff accountability.',
    Demo: HumanControlDemo,
  },
] as const;

export function WorkflowExplorer() {
  return (
    <div id="how-it-works" className={styles.explorer} data-testid="workflow-explorer">
      <div className={styles.heading}>
        <h3>Take a closer look.</h3>
        <p>Six interactive examples. Fictional data, real boundaries. Nothing is sent or saved.</p>
      </div>
      <div className={styles.workflows}>
        {workflows.map(({ id, title, note, Demo }, index) => (
          <details key={id} id={id} name="invend-workflows" className={styles.workflow}>
            <summary>
              <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <Plus size={16} aria-hidden="true" />
            </summary>
            <div className={styles.content}>
              <p>{note}</p>
              <Demo />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
