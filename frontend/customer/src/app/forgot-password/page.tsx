'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ForgotPasswordView from '@/components/auth/ForgotPasswordView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qr = searchParams.get('qr');
  const table = searchParams.get('table');

  const forwardParam = qr
    ? `?qr=${encodeURIComponent(qr)}`
    : table
    ? `?table=${encodeURIComponent(table)}`
    : '';

  const handleRequestCode = (email: string) => {
    const destParam = qr ? `&qr=${encodeURIComponent(qr)}` : (table ? `&table=${encodeURIComponent(table)}` : '');
    router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=password_reset${destParam}`);
  };

  return (
    <AuthDesktopLayout>
      <ForgotPasswordView
        onRequestCode={handleRequestCode}
        onBackToLogin={() => router.push(`/login${forwardParam}`)}
      />
    </AuthDesktopLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
