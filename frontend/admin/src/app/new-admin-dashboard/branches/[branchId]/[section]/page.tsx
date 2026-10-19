import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import NewAdminDashboard from '@/components/new-admin-dashboard/NewAdminDashboard';
import AuthGuard from '@/components/auth/AuthGuard';
import { canonicalBranchSection } from '@/components/new-admin-dashboard/views/branch-dashboard/sections';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { branchId: string; section: string };
}) {
  const resolvedParams = await params;
  const section = canonicalBranchSection(resolvedParams?.section) || 'overview';
  const label = section.charAt(0).toUpperCase() + section.slice(1);
  return {
    title: `Branch ${label} | Admin Console | Tavonza AI`,
    description: `Branch ${label.toLowerCase()} for Tavonza AI Hospitality.`,
  };
}

export default async function BranchSectionPage({
  params,
}: {
  params: { branchId: string; section: string };
}) {
  const resolvedParams = await params;
  const branchId = resolvedParams?.branchId || '';
  const rawSection = resolvedParams?.section || 'overview';
  const section = canonicalBranchSection(rawSection);

  if (!section) {
    redirect(`/new-admin-dashboard/branches/${branchId}/overview`);
  }

  if (section !== rawSection.toLowerCase()) {
    redirect(`/new-admin-dashboard/branches/${branchId}/${section}`);
  }

  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
            Loading branch...
          </div>
        }
      >
        <NewAdminDashboard
          initialTab="branches"
          initialBranchId={branchId}
          initialBranchSection={section || undefined}
        />
      </Suspense>
    </AuthGuard>
  );
}
