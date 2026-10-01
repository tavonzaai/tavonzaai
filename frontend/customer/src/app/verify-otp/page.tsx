'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OtpVerificationView from '@/components/auth/OtpVerificationView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const email = searchParams.get('email') || '';
  const type = (searchParams.get('type') as any) || 'email_verification';

  const forwardParam = table ? `?table=${encodeURIComponent(table)}` : '';

  const handleVerifySuccess = (code: string) => {
    if (type === 'password_reset') {
      const emailParam = email ? `email=${encodeURIComponent(email)}&` : '';
      const tableParam = table ? `&table=${encodeURIComponent(table)}` : '';
      router.push(`/reset-password?${emailParam}code=${encodeURIComponent(code)}${tableParam}`);
    } else {
      // Email verification successful, redirect to login
      router.push(`/login${forwardParam}`);
    }
  };

  return (
    <AuthDesktopLayout>
      <OtpVerificationView
        email={email}
        type={type}
        onVerifySuccess={handleVerifySuccess}
        onBack={() =>
          router.push(
            type === 'password_reset'
              ? `/forgot-password${forwardParam}`
              : `/register${forwardParam}`
          )
        }
      />
    </AuthDesktopLayout>
  );
}

export default function VerifyOtpPage() {
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
