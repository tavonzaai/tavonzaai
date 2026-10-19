'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './hooks';
import { getMe } from './features/authApi';
import { getAuthToken, removeAuthToken } from './api/baseApi';
import { setInitialized, setUser } from './slices/authSlice';
import { RealtimeBridge } from './RealtimeBridge';
import { setActiveBranchIdMemory, resolveBranchIdFromUser } from '../lib/auth';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken();
    if (!token) {
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    // Profile + branch always from API — never from cookies.
    dispatch(getMe())
      .unwrap()
      .then((userProfile: any) => {
        const userObj = userProfile?.user || userProfile;
        setActiveBranchIdMemory(resolveBranchIdFromUser(userObj) || userObj?.branchId);
        dispatch(setUser(userObj));
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

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <RealtimeBridge>{children}</RealtimeBridge>
      </AuthInitializer>
    </Provider>
  );
}
