'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe } from './features/authApi';
import { getAuthToken, getCookie, removeAuthToken } from './api/baseApi';
import { setInitialized, setUser } from './slices/authSlice';

export function isRoleAllowedForKitchen(user: any): boolean {
  if (!user) return false;
  const role = String(user.role || user.globalRole || '').toLowerCase();
  // ONLY kitchen role allowed - no other roles
  if (role === 'kitchen' || role === 'kitchen_staff') {
    return true;
  }
  if (Array.isArray(user.assignments)) {
    return user.assignments.some((a: any) => {
      const r = String(a?.role || '').toLowerCase();
      return r === 'kitchen' || r === 'kitchen_staff';
    });
  }
  return false;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getAuthToken(); // Checks kitchen_token strictly

    if (!token) {
      // No kitchen token: completely unauthenticated
      removeAuthToken();
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    // Demo session token
    if (token.startsWith('ktc_tok_')) {
      const raw = getCookie('kitchen_user');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (isRoleAllowedForKitchen(parsed)) {
            dispatch(setUser(parsed));
            dispatch(setInitialized(true));
            return;
          }
        } catch {}
      }
      removeAuthToken();
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    // Real API session: verify via getMe()
    dispatch(getMe())
      .unwrap()
      .then((userProfile: any) => {
        const userObj = userProfile?.user || userProfile;
        if (isRoleAllowedForKitchen(userObj)) {
          dispatch(setUser(userObj));
        } else {
          // Logged in user does NOT have kitchen privileges (e.g. customer/cashier)
          removeAuthToken();
          dispatch(setUser(null));
        }
      })
      .catch(() => {
        // Backend getMe failed or session expired
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
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
