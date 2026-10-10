import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
// test comment
export default function RootPage() {
  redirect('/login');
}
