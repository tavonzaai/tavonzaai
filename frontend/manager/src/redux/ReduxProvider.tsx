'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './hooks';
import { getMe } from './features/authApi';
import { getAuthToken, getCookie, removeAuthToken } from './api/baseApi';
import { setInitialized, setUser } from './slices/authSlice';
import { isRoleAllowedForManager } from '../lib/auth';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    if (!token) {
      removeAuthToken();
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    // Instantly restore cached session from cookie for zero-delay UI rendering
    const stored = getCookie('branch_manager_user') || getCookie('cashier_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (isRoleAllowedForManager(parsed)) {
          dispatch(setUser(parsed));
        }
      } catch {}
    }

    // Verify session with backend getMe API (Authenticated via cookies)
    dispatch(getMe())
      .unwrap()
      .then((userProfile: any) => {
        const userObj = userProfile?.user || userProfile;
        if (isRoleAllowedForManager(userObj)) {
          dispatch(setUser(userObj));
        } else {
          removeAuthToken();
          dispatch(setUser(null));
        }
      })
      .catch(() => {
        removeAuthToken();
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
