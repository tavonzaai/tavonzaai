import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Executive Admin Command Center | Tavonza AI',
  description: 'Real-time AI-powered enterprise hospitality business intelligence and operations management.',
};

export default function NewAdminDashboardIndexPage() {
  redirect('/new-admin-dashboard/dashboard');
}
