'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordView from '@/components/auth/ForgotPasswordView';

function ForgotPasswordContent() {
  const router = useRouter();

  const handleRequestCode = (email: string) => {
    router.push(`/superadmin/verify-otp?email=${encodeURIComponent(email)}&type=password_reset`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative font-inter overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <ForgotPasswordView
        onRequestCode={handleRequestCode}
        onBackToLogin={() => router.push('/superadmin/login')}
      />
    </div>
  );
}

export default function SuperAdminForgotPasswordPage() {
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
