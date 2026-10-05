'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './hooks';
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
      // Check if active branch manager session exists in cookies (Strictly Cookies Only)
      const raw = getCookie('branch_manager_user') || getCookie('cashier_user');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const role = String(parsed?.role || '').toUpperCase();
          if (
            role.includes('MANAGER') ||
            role === 'ADMIN' ||
            role === 'OWNER' ||
            parsed?.assignments?.some((a: any) => String(a.role || '').toUpperCase().includes('MANAGER'))
          ) {
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
        const isManager =
          role.includes('MANAGER') ||
          role === 'ADMIN' ||
          role === 'OWNER' ||
          userObj?.assignments?.some((a: any) => String(a.role || '').toUpperCase().includes('MANAGER'));

        if (isManager) {
          dispatch(setUser(userObj));
        } else {
          // If logged in as another role, still retain user profile
          dispatch(setUser(userObj));
        }
      })
      .catch(() => {
        // Fallback to cookie user if offline or network failure
        const raw = getCookie('branch_manager_user') || getCookie('cashier_user');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            dispatch(setUser(parsed));
            return;
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

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
