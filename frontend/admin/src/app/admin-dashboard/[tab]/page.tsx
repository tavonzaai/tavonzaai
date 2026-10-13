import { redirect } from 'next/navigation';

export default function LegacyAdminTabRedirect({ params }: { params: { tab: string } }) {
  const tab = params?.tab || 'dashboard';
  redirect(`/new-admin-dashboard/${tab}`);
}
