import { redirect } from 'next/navigation';

export default function LegacyAdminDashboardRedirect() {
  redirect('/new-admin-dashboard/dashboard');
}
