import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Branch Manager Command Center | Tavonza AI',
  description: 'Real-time AI-powered branch hospitality operations management.',
};

export default function BranchManagerDashboardIndexPage() {
  redirect('/branch-manager-dashboard/dashboard');
}

