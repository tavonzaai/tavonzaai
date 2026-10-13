import { redirect } from 'next/navigation';

export default function LegacyUpdatedAdminRedirect() {
  redirect('/new-admin-dashboard/dashboard');
}
