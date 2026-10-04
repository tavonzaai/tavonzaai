'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordView from '@/components/auth/ResetPasswordView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || searchParams.get('otp') || '';

  const forwardParam = table ? `?table=${encodeURIComponent(table)}` : '';

  return (
    <AuthDesktopLayout>
      <ResetPasswordView
        email={email}
        otp={code}
        onComplete={() => router.push(`/login${forwardParam}`)}
        onBack={() => {
          const emailParam = email ? `email=${encodeURIComponent(email)}&` : '';
          const tableParam = table ? `&table=${encodeURIComponent(table)}` : '';
          router.push(`/verify-otp?${emailParam}type=password_reset${tableParam}`);
        }}
      />
    </AuthDesktopLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
