import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordRedirectPage() {
  redirect('/superadmin/forgot-password');
}
