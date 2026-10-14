import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import NewAdminDashboard from '@/components/new-admin-dashboard/NewAdminDashboard';
import AuthGuard from '@/components/auth/AuthGuard';
import { isSettingsSection } from '@/components/new-admin-dashboard/settings-sections';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { section: string };
}) {
  const resolvedParams = await params;
  const section = resolvedParams?.section || 'org-profile';
  return {
    title: `Settings / ${section} | Admin Console | Tavonza AI`,
    description: 'Organization, profile, notification, and security settings for Tavonza AI Hospitality.',
  };
}

export default async function SettingsSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const resolvedParams = await params;
  const section = resolvedParams?.section || 'org-profile';

  if (!isSettingsSection(section)) {
    redirect('/new-admin-dashboard/settings/org-profile');
  }

  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
            Loading settings...
          </div>
        }
      >
        <NewAdminDashboard initialTab="settings" initialSettingsSection={section} />
      </Suspense>
    </AuthGuard>
  );
}
