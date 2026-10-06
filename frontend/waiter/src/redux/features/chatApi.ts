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

function getAiBaseUrl(): string {
  const envUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_API_URL;
  if (envUrl) return String(envUrl).trim().replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return 'https://ai.tavonza.com';
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  return 'https://ai.tavonza.com';
}

export const rawChatApi = {
  /**
   * Send a message to the AI Dining & Operations service
   * POST /ai/chat
   */
  sendChatMessage: async (payload: SendChatMessagePayload): Promise<ChatMessageResponse> => {
    const token = getAuthToken() || 'dev-waiter-token';
    const cleanBaseUrl = getAiBaseUrl();
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

  /**
   * Transcribe recorded audio using Whisper Cloud STT
   * POST /ai/voice/transcribe
   */
  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    const token = getAuthToken() || 'dev-waiter-token';
    const cleanBaseUrl = getAiBaseUrl();

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    const res = await fetch(`${cleanBaseUrl}/ai/voice/transcribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Voice transcription failed (${res.status}): ${errorText || res.statusText}`);
    }

    const data = await res.json();
    return data.text || '';
  },

  /**
   * Synthesize natural neural speech for JARVIS responses
   * POST /ai/voice/synthesize
   */
  fetchVoiceAudioBlob: async (text: string, persona: string = 'uk_jarvis', signal?: AbortSignal): Promise<Blob> => {
    const token = getAuthToken() || 'dev-waiter-token';
    const cleanBaseUrl = getAiBaseUrl();

    const res = await fetch(`${cleanBaseUrl}/ai/voice/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: text.slice(0, 950),
        persona,
      }),
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Voice synthesis failed (${res.status}): ${errorText || res.statusText}`);
    }

    return await res.blob();
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
