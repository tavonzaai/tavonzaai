import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sendChatMessage } from '../features/chatApi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  table?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
}

export const INITIAL_WAITER_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'jarvis',
    text: "👋 Hello! I'm JARVIS, your floor operations AI Co-pilot. I can check table occupancy, monitor kitchen ticket preparation, inspect table bills, or suggest menu upsells. How can I assist your service?",
    timestamp: 'Just now',
  },
];

const initialState: ChatState = {
  messages: INITIAL_WAITER_MESSAGES,
  isTyping: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (
      state,
      action: PayloadAction<{ text: string; timestamp?: string }>
    ) => {
      const now =
        action.payload.timestamp ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      state.messages.push({
        id: `user-${Date.now()}`,
        sender: 'user',
        text: action.payload.text,
        timestamp: now,
      });
      state.isTyping = true;
      state.error = null;
    },

    addJarvisMessage: (
      state,
      action: PayloadAction<{ text: string; timestamp?: string; table?: string }>
    ) => {
      const now =
        action.payload.timestamp ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      state.messages.push({
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: action.payload.text,
        timestamp: now,
        table: action.payload.table,
      });
      state.isTyping = false;
    },

    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    clearChat: (state) => {
      state.messages = INITIAL_WAITER_MESSAGES;
      state.isTyping = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        state.error = null;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        state.messages.push({
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: action.payload.reply,
          timestamp: now,
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload || 'JARVIS AI copilot communication failed';
      });
  },
});

export const { addUserMessage, addJarvisMessage, setTyping, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
