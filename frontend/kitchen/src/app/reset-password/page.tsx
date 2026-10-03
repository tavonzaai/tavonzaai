'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordView from '@/components/auth/ResetPasswordView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || searchParams.get('otp') || '';

  return (
    <AuthDesktopLayout>
      <ResetPasswordView
        email={email}
        otp={code}
        onComplete={() => router.push('/login')}
        onBack={() => {
          const emailParam = email ? `email=${encodeURIComponent(email)}&` : '';
          router.push(`/verify-otp?${emailParam}type=password_reset`);
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
