import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('cashier_token') || cookieStore.get('access_token');

  if (token?.value) {
    // redirect('/cashier-dashboard/dashboard');
    redirect('/updated-cashier-dashboard/table-view');
  } else {
    redirect('/login');
  }
}
