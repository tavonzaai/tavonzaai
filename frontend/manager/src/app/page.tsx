import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
// test comment
export default async function RootPage() {
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
}
