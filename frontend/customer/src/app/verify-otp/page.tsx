'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OtpVerificationView from '@/components/auth/OtpVerificationView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');

  const forwardParam = table ? `?table=${encodeURIComponent(table)}` : '';

  return (
    <AuthDesktopLayout>
      <OtpVerificationView
        onVerifySuccess={() => router.push(`/create-password${forwardParam}`)}
        onBack={() => router.push(`/register${forwardParam}`)}
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
