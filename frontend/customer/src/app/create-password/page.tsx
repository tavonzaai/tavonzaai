'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreatePasswordView from '@/components/auth/CreatePasswordView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

function CreatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qr = searchParams.get('qr');
  const table = searchParams.get('table');

  const forwardParam = qr
    ? `?qr=${encodeURIComponent(qr)}`
    : table
    ? `?table=${encodeURIComponent(table)}`
    : '';

  return (
    <AuthDesktopLayout>
      <CreatePasswordView
        onComplete={() => router.push(`/welcome${forwardParam}`)}
        onBack={() => router.push(`/verify-otp${forwardParam}`)}
      />
    </AuthDesktopLayout>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreatePasswordContent />
    </Suspense>
  );
}
