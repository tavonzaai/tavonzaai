import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function UpdatedAdminDashboardIndexPage() {
  redirect('/updated-admin-dashboard/dashboard');
}
