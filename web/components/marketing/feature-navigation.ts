import {
  BarChart3,
  Camera,
  MessagesSquare,
  Package,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';

/** Existing tour destinations only. These summaries are not live-provider availability claims. */
export const navigationFeatures = [
  {
    key: 'inbox',
    index: 0,
    name: 'Customer conversations',
    description: 'Every customer. The context to reply.',
    readiness: 'Inbox workflow · live channels still need validation.',
    icon: MessagesSquare,
  },
  {
    key: 'assistance',
    index: 1,
    name: 'AI-assisted replies',
    description: 'Known facts. Your rules. Human review.',
    readiness: 'Rule-bound assistance. Exceptions need an owner decision.',
    icon: ShieldCheck,
  },
  {
    key: 'catalogue',
    index: 2,
    name: 'Product catalogue',
    description: 'Photo-first review. Live catalogue in development.',
    readiness: 'Prototype · extraction and durable photo storage are not live.',
    icon: Camera,
  },
  {
    key: 'orders',
    index: 3,
    name: 'Order management',
    description: 'Agreed details, ready for your review.',
    readiness: 'Order workflow example · rollout validation is pending.',
    icon: Package,
  },
  {
    key: 'payments',
    index: 4,
    name: 'Payment tracking',
    description: 'Vendor confirmation, never a screenshot.',
    readiness: 'Customers pay vendors directly. No independent bank verification.',
    icon: Wallet,
  },
  {
    key: 'receipts',
    index: 5,
    name: 'Digital receipts',
    description: 'A record of a confirmed payment.',
    readiness: 'Receipt workflow · payment must be confirmed first.',
    icon: ReceiptText,
  },
  {
    key: 'insights',
    index: 6,
    name: 'Business insights',
    description: 'Past activity. Live-data validation pending.',
    readiness: 'Partial implementation · historical views, not predictions.',
    icon: BarChart3,
  },
  {
    key: 'team',
    index: 7,
    name: 'Team management',
    description: 'Clear roles. Live invitations need validation.',
    readiness: 'Partial implementation · live invitations and roles need acceptance.',
    icon: Users,
  },
] as const;

export type NavigationFeature = (typeof navigationFeatures)[number];
export type NavigationFeatureKey = NavigationFeature['key'];
export const featureDestination = (feature: NavigationFeature) => `#feature-panel-${feature.index}`;

export const navigationFeatureGroups = [
  { name: 'Conversations', indexes: [0, 1] },
  { name: 'Commerce', indexes: [2, 3] },
  { name: 'Operations', indexes: [4, 5] },
  { name: 'Business', indexes: [6, 7] },
] as const;
