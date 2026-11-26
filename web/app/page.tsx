import type { Metadata } from 'next';
import { Homepage } from '../components/marketing/homepage';

export const metadata: Metadata = {
  title: 'Selvora — Your AI sales assistant. Your business, in control.',
  description:
    'Meet Selvora, the AI sales assistant for online vendors with busy inboxes. Explore photo-first catalogues, customer conversations, human approvals and order tracking.',
};

export default function Page() {
  return <Homepage />;
}
