'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './store';
import { rtkBaseApi, getAuthToken, getApiBaseUrl } from './api/baseApi';

export function RealtimeBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const socketRef = useRef<Socket | null>(null);
  const [_isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const apiUrl = getApiBaseUrl();

    const socket = io(apiUrl, {
      auth: token ? { token } : undefined,
      query: user?.branchId ? { branchId: user.branchId } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Realtime:Cashier] Connected to Socket.IO gateway');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Realtime:Cashier] Disconnected from Socket.IO gateway');
    });

    // Realtime UI Cache Invalidation & Event Dispatch
    socket.on('TABLE_STATUS_CHANGED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['TABLE', 'DASHBOARD']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:table_status_changed', { detail: payload }));
      }
    });

    socket.on('TABLE_SESSION_STATUS_CHANGED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['TABLE', 'DASHBOARD', 'ORDER']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:table_session_changed', { detail: payload }));
      }
    });

    socket.on('ORDER_CREATED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['ORDER', 'ORDER_ITEM', 'DASHBOARD']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:order_created', { detail: payload }));
      }
    });

    socket.on('ORDER_STATUS_CHANGED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['ORDER', 'ORDER_ITEM', 'DASHBOARD']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:order_status_changed', { detail: payload }));
      }
    });

    socket.on('ORDER_ITEM_STATUS_CHANGED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['ORDER_ITEM', 'ORDER']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:order_item_changed', { detail: payload }));
      }
    });

    socket.on('PAYMENT_STATUS_CHANGED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['PAYMENT', 'ORDER', 'TABLE', 'DASHBOARD']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:payment_status_changed', { detail: payload }));
      }
    });

    socket.on('PAYMENT_REQUESTED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['PAYMENT', 'TABLE', 'DASHBOARD']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:payment_requested', { detail: payload }));
      }
    });

    socket.on('NOTIFICATION_CREATED', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['NOTIFICATION']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:notification_created', { detail: payload }));
      }
    });

    socket.on('NOTIFICATION_READ', (payload) => {
      dispatch(rtkBaseApi.util.invalidateTags(['NOTIFICATION']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:notification_read', { detail: payload }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user?.branchId]);

  return <>{children}</>;
}
