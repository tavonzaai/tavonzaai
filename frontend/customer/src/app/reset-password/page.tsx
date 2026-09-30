'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ResetPasswordView from '@/components/auth/ResetPasswordView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <AuthDesktopLayout>
      <ResetPasswordView
        onComplete={() => router.push('/menu')}
        onBack={() => router.push('/verify-otp')}
      />
    </AuthDesktopLayout>
  );
}

