import type { Metadata, Viewport } from 'next';
import { Homepage } from '../components/marketing/homepage';

export const metadata: Metadata = {
  title: 'Invend — Every conversation. Every order. One workspace.',
  description:
    'Bring customer conversations, products and orders together with Invend. Explore fact-aware AI assistance, clear sales workflows and owner control, with honest rollout and pricing information.',
};

// Marketing chrome follows this page; the authenticated workspace retains its own theme.
export const viewport: Viewport = { themeColor: '#FFFEFC' };

export default function Page() {
  return <Homepage />;
}
