'use client';

import React, { useState } from 'react';
import LoginView from './LoginView';
import ForgotPasswordView from './ForgotPasswordView';
import OtpVerificationView from './OtpVerificationView';
import ResetPasswordView from './ResetPasswordView';
import CreateAccountView from './CreateAccountView';
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
}: AuthFlowProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpType, setOtpType] = useState<'email_verification' | 'password_reset'>('email_verification');

  return (
    <AuthDesktopLayout>
      {currentScreen === 'login' && (
        <LoginView
          initialEmail={userEmail}
          onLoginSuccess={onAuthComplete}
          onForgotPassword={() => setCurrentScreen('forgot-password')}
          onCreateAccount={() => setCurrentScreen('create-account')}
          onNavigateToVerify={(email) => {
            setUserEmail(email);
            setOtpType('email_verification');
            setCurrentScreen('verify-otp');
          }}
        />
      )}

      {currentScreen === 'create-account' && (
        <CreateAccountView
          onAccountCreated={(createdEmail) => {
            if (createdEmail) setUserEmail(createdEmail);
            setOtpType('email_verification');
            setCurrentScreen('verify-otp');
          }}
          onGoBackToLogin={(email) => {
            if (email) setUserEmail(email);
            setCurrentScreen('login');
          }}
        />
      )}

      {currentScreen === 'forgot-password' && (
        <ForgotPasswordView
          onRequestCode={(email) => {
            setUserEmail(email);
            setOtpType('password_reset');
            setCurrentScreen('verify-otp');
          }}
          onBackToLogin={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'verify-otp' && (
        <OtpVerificationView
          email={userEmail}
          type={otpType}
          onVerifySuccess={(code) => {
            if (otpType === 'password_reset') {
              setOtpCode(code);
              setCurrentScreen('reset-password');
            } else {
              // Email verification complete -> prompt to login
              setCurrentScreen('login');
            }
          }}
          onBack={() => setCurrentScreen(otpType === 'password_reset' ? 'forgot-password' : 'create-account')}
        />
      )}

      {currentScreen === 'reset-password' && (
        <ResetPasswordView
          email={userEmail}
          otp={otpCode}
          onComplete={() => setCurrentScreen('login')}
          onBack={() => setCurrentScreen('verify-otp')}
        />
      )}
    </AuthDesktopLayout>
  );
}
