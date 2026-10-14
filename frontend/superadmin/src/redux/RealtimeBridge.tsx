'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from './store';
import { rtkBaseApi, getAuthToken, getApiBaseUrl } from './api/baseApi';

export function RealtimeBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const [_isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const apiUrl = getApiBaseUrl();

    try {
      const socket = io(apiUrl, {
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('TENANT_CREATED', () => {
        dispatch(rtkBaseApi.util.invalidateTags(['TENANT', 'METRICS']));
      });

      socket.on('SUBSCRIPTION_UPDATED', () => {
        dispatch(rtkBaseApi.util.invalidateTags(['BILLING', 'METRICS', 'TENANT']));
      });

      return () => {
        socket.disconnect();
      };
    } catch {}
  }, [dispatch]);

  return <>{children}</>;
}
