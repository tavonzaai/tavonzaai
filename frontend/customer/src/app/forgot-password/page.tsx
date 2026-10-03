'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordView from '@/components/auth/ForgotPasswordView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <AuthDesktopLayout>
      <ForgotPasswordView
        onRequestCode={() => router.push('/verify-otp')}
        onBackToLogin={() => router.push('/login')}
      />
    </AuthDesktopLayout>
  );
}

