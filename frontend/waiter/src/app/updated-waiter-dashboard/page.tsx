import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function UpdatedWaiterDashboardIndexPage() {
  redirect('/updated-waiter-dashboard/floor-view');
}
