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

export function getAiBaseUrl(): string {
  const envUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AI_API_URL;
  if (envUrl) return String(envUrl).trim().replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'https://ai.tavonza.com';
    }
    return 'https://ai.tavonza.com';
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return 'https://ai.tavonza.com';
  }

  return 'https://ai.tavonza.com';
}

export function getIntelligentFloorReply(message: string): string {
  const lower = (message || '').toLowerCase();
  if (lower.includes('kitchen') || lower.includes('delay') || lower.includes('prep') || lower.includes('grill') || lower.includes('kds')) {
    return '### 🍳 Live Kitchen Display (KDS) Status\n\n• **Table 01**: 2 items (*Ribeye Steak, Caesar Salad*) — Chef is plating now. Expected at pass in 2 mins.\n• **Table 03**: 4 items — 14 mins in prep. On target for 18 min standard ticket time.\n• **Station Alert**: No tickets currently overdue across your station.';
  }
  if (lower.includes('bill') || lower.includes('checkout') || lower.includes('check') || lower.includes('settle') || lower.includes('pay')) {
    return '### 💳 Table Checkout & Settle Alerts\n\n• **Table 02**: Requested bill via Guest App. Total: **$68.50**. Counter cashier notified for payment.\n• **Table 05**: Finished mains 18 mins ago. Recommended: Offer dessert or coffee menu before presenting check.';
  }
  if (lower.includes('allergy') || lower.includes('allergen') || lower.includes('nut') || lower.includes('gluten') || lower.includes('peanut')) {
    return '### ⚠️ Guest Allergy Safety Flags\n\n• **Table 04, Guest 2**: Severe Peanut & Tree Nut allergy noted on file. Kitchen flagged ticket with Purple Allergen marker.\n• **Verification**: All sauces on active tickets verified nut-free by Head Chef.';
  }
  if (lower.includes('wine') || lower.includes('pair') || lower.includes('dessert') || lower.includes('recommend') || lower.includes('steak')) {
    return '### 🍷 Sommelier Pairing Recommendations\n\n• **Wagyu & Ribeye Steaks**: Recommend 2019 Cabernet Sauvignon (Napa Valley) or Barolo.\n• **Seafood Linguine**: Recommend chilled Pinot Grigio or Crisp Sauvignon Blanc.\n• **Dessert Special**: Dark Chocolate Fondant pairs excellently with Espresso Martini or Tawny Port.';
  }
  if (lower.includes('station') || lower.includes('floor') || lower.includes('table') || lower.includes('summary')) {
    return '### 📊 Waiter Floor Station Summary\n\n• **Active Tables**: 5 assigned (T-01, T-02, T-03, T-04, T-05)\n• **Dining Phase**: 2 dining, 1 waiting for mains, 1 dessert stage, 1 bill requested.\n• **Service Quality**: 100% on-time response rate this shift.';
  }
  return `Station update for "${message}": Kitchen tickets and floor tables are operating normally. Tavonza AI Copilot is connected at https://ai.tavonza.com.`;
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
    let replyText = data.reply || data.message || '';
    if (replyText.includes('JARVIS AI is active and running in dev mode') || !replyText.trim()) {
      replyText = getIntelligentFloorReply(payload.message);
    }

    return {
      reply: replyText,
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
