import { redirect } from 'next/navigation';

export default function LegacyUpdatedAdminTabRedirect({ params }: { params: { tab: string } }) {
  const tab = params?.tab || 'dashboard';
  redirect(`/new-admin-dashboard/${tab}`);
}
