import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function SettingsIndexPage() {
  redirect('/new-admin-dashboard/settings/org-profile');
}
