import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthToken } from '../api/baseApi';

// ─────────────────────────────────────────
// 📋 Data Models & Interfaces for Waiter AI Copilot
// ─────────────────────────────────────────

export interface SendChatMessagePayload {
  message: string;
  sessionId?: string;
  tableNumber?: string;
}

export interface ChatMessageResponse {
  reply: string;
  session_id?: string;
  action?: string;
  data?: any;
}

// ─────────────────────────────────────────
// 🌐 Raw Waiter Chat API Client
// ─────────────────────────────────────────

export const rawChatApi = {
  /**
   * Send a message to the AI Dining & Operations service
   * POST /ai/chat
   */
  sendChatMessage: async (payload: SendChatMessagePayload): Promise<ChatMessageResponse> => {
    const token = getAuthToken() || 'dev-waiter-token';
    const aiBaseUrl =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_API_URL) ||
      'http://localhost:8000';

    const cleanBaseUrl = String(aiBaseUrl).trim().replace(/\/$/, '');
    const cleanSessionId =
      payload.sessionId ||
      (payload.tableNumber
        ? `waiter_table_${payload.tableNumber.replace(/\s+/g, '_').toLowerCase()}`
        : 'waiter_floor_copilot');

    const res = await fetch(`${cleanBaseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: payload.message,
        session_id: cleanSessionId,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`AI HTTP status ${res.status}: ${errorText || res.statusText}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || data.message || '',
      session_id: data.session_id || cleanSessionId,
      action: data.action,
      data: data.data,
    };
  },
};

// ─────────────────────────────────────────
// ⚡ Redux Async Thunk
// ─────────────────────────────────────────

export const sendChatMessage = createAsyncThunk<
  ChatMessageResponse,
  SendChatMessagePayload,
  { rejectValue: string }
>('chat/sendMessage', async (payload, { rejectWithValue }) => {
  try {
    return await rawChatApi.sendChatMessage(payload);
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to communicate with JARVIS AI copilot.');
  }
});
