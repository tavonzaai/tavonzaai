'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { getMe } from './features/authApi';
import { getAuthToken, getCookie, removeAuthToken } from './api/baseApi';
import { setInitialized, setUser } from './slices/authSlice';

export function isRoleAllowedForAdmin(user: any): boolean {
  if (!user) return false;
  const role = String(user.role || user.globalRole || '').toLowerCase();
  // ONLY Admin and Owner roles allowed - strictly no unauthorized staff or customer roles
  const allowedRoles = ['admin', 'super_admin', 'superadmin', 'owner', 'restaurant_owner'];
  if (allowedRoles.includes(role)) {
    return true;
  }
  if (Array.isArray(user.assignments)) {
    return user.assignments.some((a: any) => {
      const r = String(a?.role || '').toLowerCase();
      return allowedRoles.includes(r);
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

    const token = getAuthToken(); // Checks admin_token strictly

    if (!token) {
      removeAuthToken();
      dispatch(setUser(null));
      dispatch(setInitialized(true));
      return;
    }

    // Demo session token
    if (token.startsWith('adm_tok_')) {
      const raw = getCookie('admin_user');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (isRoleAllowedForAdmin(parsed)) {
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
        if (isRoleAllowedForAdmin(userObj)) {
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

