import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  const cookieStore = cookies();
  const token =
    cookieStore.get('branch_manager_token') ||
    cookieStore.get('access_token') ||
    cookieStore.get('branch_manager_user');

  if (token?.value) {
    redirect('/branch-manager-dashboard/dashboard');
  } else {
    redirect('/login');
  }
}
