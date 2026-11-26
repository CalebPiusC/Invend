import type { Metadata } from 'next';
import { DataProvider } from '../../components/data/provider';
import { FriendTools } from '../../components/data/friend-tools';
import { Workspace } from '../../components/workspace';
import { parseDataMode } from '../../lib/data/mode';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Your workspace — Selvora',
  robots: { index: false, follow: false },
};

/** Preserve the existing workspace; public pages never mount its tenant/data providers. */
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const { auth } = await searchParams;
  const authEntry = auth === 'sign-in' || auth === 'sign-up';
  // An account CTA must never silently sign someone into a fictional business.
  const mode = authEntry ? 'api' : parseDataMode(process.env.DATA_MODE);
  return (
    <DataProvider mode={mode}>
      <Workspace initialSignUp={auth !== 'sign-in'} />
      <FriendTools />
    </DataProvider>
  );
}
