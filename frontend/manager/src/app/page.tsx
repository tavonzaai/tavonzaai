import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // Show direct branch manager dashboard on this port
  redirect('/branch-manager-dashboard/dashboard');

  /*
  const cookieStore = await cookies();
  const token =
    cookieStore.get('branch_manager_token')?.value ||
    cookieStore.get('access_token')?.value;
  const user = cookieStore.get('branch_manager_user')?.value;

  if (token && user) {
    redirect('/branch-manager-dashboard/dashboard');
  } else {
    redirect('/login');
  }
  */
}

