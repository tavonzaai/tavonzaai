'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe, DEMO_SUPERADMIN_USER } from './features/authApi';
import { getAuthToken, getCookie, setAuthTokens, setCookie, SUPERADMIN_USER_KEY } from './api/baseApi';
import { setUser, setInitialized } from './slices/authSlice';
import { RealtimeBridge } from './RealtimeBridge';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    const stored = getCookie(SUPERADMIN_USER_KEY) || getCookie('admin_user');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch(setUser(parsed));
      } catch {
        dispatch(setUser(DEMO_SUPERADMIN_USER));
      }
    } else if (token) {
      dispatch(setUser(DEMO_SUPERADMIN_USER));
    }

    if (token) {
      dispatch(getMe());
    } else {
      // In development / prototype, initialize demo user so session is active unless explicitly signed out
      const isLoggedOut = getCookie('superadmin_logged_out') === 'true';
      if (!isLoggedOut) {
        const demoToken = 'superadmin_token_demo';
        setAuthTokens({ accessToken: demoToken, refreshToken: 'refresh_' + demoToken });
        setCookie(SUPERADMIN_USER_KEY, JSON.stringify(DEMO_SUPERADMIN_USER));
        dispatch(setUser(DEMO_SUPERADMIN_USER));
      } else {
        dispatch(setUser(null));
      }
      dispatch(setInitialized(true));
    }
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
