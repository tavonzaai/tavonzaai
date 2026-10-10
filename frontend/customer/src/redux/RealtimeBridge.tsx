'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './store';
import { rtkBaseApi, getAuthToken, getApiBaseUrl } from './api/baseApi';

export function RealtimeBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session.currentSession);
  const socketRef = useRef<Socket | null>(null);
  const [_isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const apiUrl = getApiBaseUrl();

    const query: Record<string, string> = {};
    if (session?.id) query.tableSessionId = session.id;
    if (session?.tableId) query.tableId = session.tableId;
    if (session?.branchId) query.branchId = session.branchId;

    const socket = io(apiUrl, {
      auth: token ? { token } : undefined,
      query: Object.keys(query).length > 0 ? query : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Realtime:Customer] Connected to Socket.IO gateway');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Realtime:Customer] Disconnected from Socket.IO gateway');
    });

    // Realtime UI Cache Invalidation & Event Dispatch
    socket.on('ORDER_STATUS_CHANGED', (payload: any) => {
      dispatch(rtkBaseApi.util.invalidateTags(['ORDER', 'ORDER_ITEM']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:order_status_changed', { detail: payload }));
      }
    });

    socket.on('ORDER_ITEM_STATUS_CHANGED', (payload: any) => {
      dispatch(rtkBaseApi.util.invalidateTags(['ORDER', 'ORDER_ITEM']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:order_item_changed', { detail: payload }));
      }
    });

    socket.on('ORDER_CREATED', (payload: any) => {
      dispatch(rtkBaseApi.util.invalidateTags(['ORDER']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:order_created', { detail: payload }));
      }
    });

    socket.on('TABLE_STATUS_CHANGED', (payload: any) => {
      dispatch(rtkBaseApi.util.invalidateTags(['TABLE']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:table_status_changed', { detail: payload }));
      }
    });

    socket.on('TABLE_SESSION_STATUS_CHANGED', (payload: any) => {
      dispatch(rtkBaseApi.util.invalidateTags(['TABLE', 'ORDER']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:table_session_changed', { detail: payload }));
      }
    });

    socket.on('PAYMENT_STATUS_CHANGED', (payload: any) => {
      dispatch(rtkBaseApi.util.invalidateTags(['PAYMENT', 'ORDER']));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tavonza:payment_status_changed', { detail: payload }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, session?.id, session?.tableId, session?.branchId]);

  return <>{children}</>;
}
