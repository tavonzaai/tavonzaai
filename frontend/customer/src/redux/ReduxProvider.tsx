'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe } from './features/authApi';
import { getAuthToken } from './api/baseApi';
import { setInitialized } from './slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    if (token) {
      // Token exists in cookies: verify session once with backend
      dispatch(getMe());
    } else {
      // No token in cookies: immediately mark auth initialization complete
      dispatch(setInitialized(true));
    }
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

