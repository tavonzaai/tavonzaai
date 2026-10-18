'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe } from './features/authApi';
import { getAuthToken, getCookie, SUPERADMIN_USER_KEY, removeAuthToken } from './api/baseApi';
import { setUser, setInitialized } from './slices/authSlice';
import { RealtimeBridge } from './RealtimeBridge';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    if (!token || token.startsWith('superadmin_token_demo')) {
      if (token?.startsWith('superadmin_token_demo')) {
        removeAuthToken();
      }
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    const stored = getCookie(SUPERADMIN_USER_KEY) || getCookie('admin_user');
    if (stored) {
      try {
        dispatch(setUser(JSON.parse(stored)));
      } catch {
        // ignore corrupt cache; getMe will refresh
      }
    }

    dispatch(getMe());
  }, [dispatch]);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <RealtimeBridge>{children}</RealtimeBridge>
      </AuthInitializer>
    </Provider>
  );
}
