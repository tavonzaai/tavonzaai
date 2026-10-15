'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordView from '../../components/auth/ResetPasswordView';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || searchParams.get('otp') || '';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-400/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative z-10 w-full">
        <ResetPasswordView
          email={email}
          otp={code}
          onComplete={() => router.push('/login')}
          onBack={() => {
            const emailParam = email ? `email=${encodeURIComponent(email)}&` : '';
            router.push(`/verify-otp?${emailParam}type=password_reset`);
          }}
        />
      </div>
    </div>
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
