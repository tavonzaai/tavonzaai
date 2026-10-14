import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BranchDetailIndexPage({
  params,
}: {
  params: { branchId: string };
}) {
  const resolvedParams = await params;
  const branchId = resolvedParams?.branchId || '';
  redirect(`/new-admin-dashboard/branches/${branchId}/overview`);
}
