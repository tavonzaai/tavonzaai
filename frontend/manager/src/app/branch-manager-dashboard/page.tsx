import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BranchManagerDashboardIndexPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('access_token')?.value ||
    cookieStore.get('branch_manager_token')?.value;

  if (!token) {
    redirect('/login');
  }

export default function BranchManagerDashboardIndexPage() {
  redirect('/branch-manager-dashboard/dashboard');
}

