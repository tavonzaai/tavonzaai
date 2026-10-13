'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe } from './features/authApi';
import { getAuthToken, getCookie } from './api/baseApi';
import { setInitialized, setUser } from './slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    if (!token) {
      // Check if active cashier session exists in cookies (STRICTLY COOKIES ONLY)
      const raw = getCookie('cashier_user');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (String(parsed?.role || '').toUpperCase() === 'CASHIER') {
            dispatch(setUser(parsed));
            dispatch(setInitialized(true));
            return;
          }
        } catch {}
      }
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    // Verify session with backend getMe API (Authenticated via cookies)
    dispatch(getMe())
      .unwrap()
      .then((userProfile: any) => {
        const userObj = userProfile?.user || userProfile;
        const role = String(userObj?.role || '').toUpperCase();
        const isCashier =
          role === 'CASHIER' ||
          userObj?.assignments?.some((a: any) => String(a.role || '').toUpperCase() === 'CASHIER');

        if (isCashier) {
          dispatch(setUser(userObj));
        } else {
          // Authenticated on backend but not as Cashier: reject session
          dispatch(setUser(null));
        }
      })
      .catch(() => {
        // Fallback to cookie cashier user if offline or network error
        const raw = getCookie('cashier_user');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (String(parsed?.role || '').toUpperCase() === 'CASHIER') {
              dispatch(setUser(parsed));
              return;
            }
          } catch {}
        }
        dispatch(setUser(null));
      })
      .finally(() => {
        dispatch(setInitialized(true));
      });
  }, [dispatch]);

  return <>{children}</>;
}

import { RealtimeBridge } from './RealtimeBridge';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <RealtimeBridge>{children}</RealtimeBridge>
      </AuthInitializer>
    </Provider>
  );
}
