import { useDispatch } from "react-redux";
import { useCallback, useMemo, useRef } from "react";

import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat as deleteChatApi,
} from "../sevices/chat.api.js";

import {
  setChats,
  setMessages,
  addMessage,
  setError,
  setLoading,
  setCurrentChatId,
  removeChat,
  clearMessages,
} from "../chat.slice.js";

import { initializeSocketConnection } from "../sevices/chat.socket.js";

export const useChat = () => {
  const dispatch = useDispatch();
  const inFlightRef = useRef(false);

  const loadChats = useCallback(async () => {
    try {
      const chats = await getChats();
      dispatch(setChats(Array.isArray(chats) ? chats : []));
      return chats;
    } catch (err) {
      console.error("Failed to load chats:", err);
      return [];
    }
  }, [dispatch]);

  const loadMessages = useCallback(
    async (chatId) => {
      if (!chatId) return [];
      try {
        const res = await getMessages(chatId);
        const msgs = res?.messages ?? res ?? [];
        dispatch(setMessages(msgs));
        dispatch(setCurrentChatId(chatId));
        return msgs;
      } catch (err) {
        console.error("Failed to load messages:", err);
        dispatch(setMessages([]));
        return [];
      }
    },
    [dispatch]
  );

  const handleSendMessage = useCallback(
    async ({ chatId, message, images = [] }) => {
      if (inFlightRef.current) return null;
      inFlightRef.current = true;

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // Optimistic user message (with image previews)
        dispatch(addMessage({
          role: "user",
          content: message,
          images: images.map(img => ({ data: img.data, mimeType: img.mimeType, name: img.name })),
          _optimistic: true,
        }));

        const result = await sendMessage(chatId, message, images);

        // Append AI response
        if (result?.message) {
          dispatch(addMessage({ role: "ai", content: result.message }));
        }

        // Refresh sidebar to show new/updated chat
        await loadChats();

        return result;
      } catch (error) {
        // Show the actual server error (rate limit, timeout, etc.)
        const errorMsg = error.message || "Failed to send message. Please try again.";
        dispatch(setError(errorMsg));

        // Mark the last optimistic message as failed so Retry button appears
        dispatch(addMessage({
          role: "ai",
          content: `⚠️ ${errorMsg}`,
          _failed: true,
        }));

        return null;
      } finally {
        dispatch(setLoading(false));
        inFlightRef.current = false;
      }
    },
    [dispatch, loadChats]
  );

  const handleDeleteChat = useCallback(
    async (chatId) => {
      try {
        await deleteChatApi(chatId);
        dispatch(removeChat(chatId));
      } catch (err) {
        dispatch(setError(err.message || "Failed to delete chat"));
      }
    },
    [dispatch]
  );

  const handleClearMessages = useCallback(() => {
    dispatch(clearMessages());
    dispatch(setCurrentChatId(null));
  }, [dispatch]);

  const stableSocket = useMemo(() => initializeSocketConnection, []);

  return useMemo(
    () => ({
      handleSendMessage,
      loadChats,
      loadMessages,
      handleDeleteChat,
      handleClearMessages,
      initializeSocketConnection: stableSocket,
    }),
    [handleSendMessage, loadChats, loadMessages, handleDeleteChat, handleClearMessages, stableSocket]
  );
};
