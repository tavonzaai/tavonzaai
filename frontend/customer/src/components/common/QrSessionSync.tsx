'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { getCookie, setCookie } from '@/redux/api/baseApi';
import { QR_COOKIE_NAME, resolveQrSession } from '@/lib/qrSession';

export default function QrSessionSync() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const resolvedRef = useRef<string | null>(null);

  useEffect(() => {
    const qrParam = searchParams.get('qr');
    const cookieQr = getCookie(QR_COOKIE_NAME);
    const effectiveQr = qrParam || cookieQr;

    // Persist QR token if present in query
    if (qrParam) {
      setCookie(QR_COOKIE_NAME, qrParam);
      try {
        localStorage.setItem(QR_COOKIE_NAME, qrParam);
      } catch {}

      // Resolve table & branch from backend if not resolved yet
      if (resolvedRef.current !== qrParam) {
        resolvedRef.current = qrParam;
        resolveQrSession(qrParam);
      }
    } else if (cookieQr && resolvedRef.current !== cookieQr) {
      resolvedRef.current = cookieQr;
      resolveQrSession(cookieQr);
    }

    // If auth state is initialized and user is NOT authenticated
    if (isInitialized && !isAuthenticated && effectiveQr) {
      // 1. If at root "/", redirect to "/login?qr=..."
      if (pathname === '/') {
        router.replace(`/login?qr=${encodeURIComponent(effectiveQr)}`);
        return;
      }

      // 2. If at an unauthenticated auth page without "?qr=", append "?qr=..."
      const isAuthPage =
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/verify-otp' ||
        pathname === '/forgot-password' ||
        pathname === '/create-password' ||
        pathname === '/reset-password';

      if (isAuthPage && !searchParams.has('qr')) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('qr', effectiveQr);
        router.replace(`${pathname}?${newParams.toString()}`);
      }
    }
  }, [pathname, searchParams, isAuthenticated, isInitialized, router]);

  // Global anchor click listener to maintain ?qr= query across all internal unauthenticated links
  useEffect(() => {
    if (isAuthenticated) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;

      const cookieQr = getCookie(QR_COOKIE_NAME) || (typeof window !== 'undefined' ? localStorage.getItem(QR_COOKIE_NAME) : null);
      if (!cookieQr) return;

      // If internal link doesn't already have ?qr=, intercept and append it
      if (!href.includes('qr=')) {
        e.preventDefault();
        const separator = href.includes('?') ? '&' : '?';
        const targetUrl = `${href}${separator}qr=${encodeURIComponent(cookieQr)}`;
        router.push(targetUrl);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isAuthenticated, router]);

  return null;
}
