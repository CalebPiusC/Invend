import { PublicReceipt } from '../../../components/receipts/public-receipt';
// Preserve the former dynamic root's no-store and runtime sample/privacy boundary.
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default function SharedReceipt() {
  return <PublicReceipt allowSample={process.env.DATA_MODE === 'mock'} />;
}
