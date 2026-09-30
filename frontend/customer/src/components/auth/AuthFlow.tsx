'use client';

import React, { useState } from 'react';
import LoginView from './LoginView';
import ForgotPasswordView from './ForgotPasswordView';
import OtpVerificationView from './OtpVerificationView';
import ResetPasswordView from './ResetPasswordView';
import CreateAccountView from './CreateAccountView';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

import AuthDesktopLayout from './AuthDesktopLayout';

export type AuthScreen =
  | 'login'
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password'
  | 'create-account'
  | 'success';

interface AuthFlowProps {
  initialScreen?: AuthScreen;
  onAuthComplete: () => void;
  onBackToLanding?: () => void;
}

export default function AuthFlow({
  initialScreen = 'login',
  onAuthComplete,
  onBackToLanding,
}: AuthFlowProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  return (
    <AuthDesktopLayout>
      {currentScreen === 'login' && (
        <LoginView
          onLoginSuccess={onAuthComplete}
          onForgotPassword={() => setCurrentScreen('forgot-password')}
          onCreateAccount={() => setCurrentScreen('create-account')}
        />
      )}

      {currentScreen === 'forgot-password' && (
        <ForgotPasswordView
          onRequestCode={(email) => {
            setUserEmail(email);
            setCurrentScreen('verify-otp');
          }}
          onBackToLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'verify-otp' && (
        <OtpVerificationView
          onVerifySuccess={(code) => {
            // The API only checks the code when the new password is submitted,
            // so it is carried forward rather than verified here.
            setOtpCode(code);
            setCurrentScreen('reset-password');
          }}
          onBack={() => setCurrentScreen('forgot-password')}
        />
      )}

      {currentScreen === 'reset-password' && (
        <ResetPasswordView
          email={userEmail}
          otp={otpCode}
          onComplete={onAuthComplete}
          onBack={() => setCurrentScreen('verify-otp')}
        />
      )}

      {currentScreen === 'create-account' && (
        <CreateAccountView
          onAccountCreated={onAuthComplete}
          onGoBackToLogin={() => setCurrentScreen('login')}
        />
      )}
    </AuthDesktopLayout>
  );
}

