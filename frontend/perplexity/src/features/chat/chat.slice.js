import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  messages: [],
  currentChatId: null,
  isloading: false,
  error: null,
  sidebarOpen: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats(state, action) {
      state.chats = action.payload;
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setCurrentChatId(state, action) {
      state.currentChatId = action.payload;
    },
    setLoading(state, action) {
      state.isloading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    prependChat(state, action) {
      // Add newly created chat to the top of the list
      const exists = state.chats.some((c) => c._id === action.payload._id);
      if (!exists) {
        state.chats.unshift(action.payload);
      }
    },
    removeChat(state, action) {
      state.chats = state.chats.filter((c) => c._id !== action.payload);
      if (state.currentChatId === action.payload) {
        state.currentChatId = null;
        state.messages = [];
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const {
  setChats,
  setMessages,
  addMessage,
  setCurrentChatId,
  setLoading,
  setError,
  setSidebarOpen,
  prependChat,
  removeChat,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;