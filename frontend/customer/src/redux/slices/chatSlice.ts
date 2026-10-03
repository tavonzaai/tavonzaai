import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sendChatMessage } from '../features/chatApi';

export interface ChatDishItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dishes?: ChatDishItem[];
  callWaiter?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  showWaiterAlert: boolean;
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "👋 Hi there! I'm your Tavonza AI Dining Concierge. I can recommend dishes, verify ingredients & allergies, recommend drink pairings, or assist your table. How can I help you today?",
    timestamp: 'Just now',
  },
];

const initialState: ChatState = {
  messages: INITIAL_CHAT_MESSAGES,
  isTyping: false,
  error: null,
  showWaiterAlert: false,
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

    addAiMessage: (
      state,
      action: PayloadAction<{
        text: string;
        timestamp?: string;
        dishes?: ChatDishItem[];
        callWaiter?: boolean;
      }>
    ) => {
      const now =
        action.payload.timestamp ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      state.messages.push({
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: action.payload.text,
        timestamp: now,
        dishes: action.payload.dishes,
        callWaiter: action.payload.callWaiter,
      });
      state.isTyping = false;
    },

    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    setShowWaiterAlert: (state, action: PayloadAction<boolean>) => {
      state.showWaiterAlert = action.payload;
    },

    clearChat: (state) => {
      state.messages = INITIAL_CHAT_MESSAGES;
      state.isTyping = false;
      state.error = null;
      state.showWaiterAlert = false;
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
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: action.payload.reply,
          timestamp: now,
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload || 'AI concierge communication failed';
      });
  },
});

export const {
  addUserMessage,
  addAiMessage,
  setTyping,
  setShowWaiterAlert,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
