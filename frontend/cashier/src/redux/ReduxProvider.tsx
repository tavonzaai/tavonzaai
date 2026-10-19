'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe } from './features/authApi';
import { getAuthToken } from './api/baseApi';
import { setInitialized, setUser } from './slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    if (!token || token.startsWith('csh_tok_')) {
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
          dispatch(setUser(null));
        }
      })
      .catch(() => {
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
