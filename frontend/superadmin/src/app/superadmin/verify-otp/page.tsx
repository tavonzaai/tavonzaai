'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OtpVerificationView from '@/components/auth/OtpVerificationView';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'password_reset';

  const handleVerifySuccess = (code: string) => {
    if (type === 'password_reset') {
      const emailParam = email ? `email=${encodeURIComponent(email)}&` : '';
      router.push(`/superadmin/reset-password?${emailParam}code=${encodeURIComponent(code)}`);
    } else {
      router.push('/superadmin/login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative font-inter overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <OtpVerificationView
        email={email}
        type={type}
        onVerifySuccess={handleVerifySuccess}
        onBack={() =>
          router.push(type === 'password_reset' ? '/superadmin/forgot-password' : '/superadmin/login')
        }
      />
    </div>
  );
}

export default function SuperAdminVerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
