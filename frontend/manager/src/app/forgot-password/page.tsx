'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordView from '../../components/auth/ForgotPasswordView';

function ForgotPasswordContent() {
  const router = useRouter();

  const handleRequestCode = (email: string) => {
    router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=password_reset`);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-400/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative z-10 w-full">
        <ForgotPasswordView
          onRequestCode={handleRequestCode}
          onBackToLogin={() => router.push('/login')}
        />
      </div>
    </div>
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
