import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function TenantDetailRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/superadmin/tenants/${params.id}`);
}
