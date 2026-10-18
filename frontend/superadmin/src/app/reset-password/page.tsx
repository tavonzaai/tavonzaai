import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, val]) => {
      if (typeof val === 'string') query.set(key, val);
    });
  }
  const queryString = query.toString();
  redirect(`/superadmin/reset-password${queryString ? `?${queryString}` : ''}`);
}
