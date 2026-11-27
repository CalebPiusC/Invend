import type { Metadata, Viewport } from 'next';
import { Homepage } from '../components/marketing/homepage';

export const metadata: Metadata = {
  title: 'Invend — Your AI sales assistant. Your business, in control.',
  description:
    'Meet Invend, the AI sales assistant for online vendors with busy inboxes. Explore photo-first catalogues, customer conversations, human approvals and order tracking.',
};

// Marketing chrome follows this page; the authenticated workspace retains its own theme.
export const viewport: Viewport = { themeColor: '#FFFEFA' };

export default function Page() {
  return <Homepage />;
}
