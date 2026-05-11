import { useDispatch } from "react-redux";

import {
  sendMessage,
  getChats
} from "../../chat/sevices/chat.api.js";

import {
  setChats,
  setError,
  setLoading
} from "../chat.slice.js";

import { initializeSocketConnection } from "../sevices/chat.socket.js";

import { useCallback, useMemo, useRef } from "react";

export const useChat = () => {
  const dispatch = useDispatch();
  const inFlightRef = useRef(false);

  const loadChats = useCallback(async () => {
    const chats = await getChats();
    dispatch(setChats(chats));
    return chats;
  }, [dispatch]);

  const handleSendMessage = useCallback(async ({ chatId, message }) => {
    // Prevent duplicate concurrent requests from UI
    if (inFlightRef.current) return null;
    inFlightRef.current = true;

    try {
      dispatch(setLoading(true));

      const result = await sendMessage(chatId, message);

      // Keep sidebar in sync immediately after title creation
      await loadChats();
      return result;
    } catch (error) {
      dispatch(setError(error.message || "Failed to send message"));
      return null;
    } finally {
      dispatch(setLoading(false));
      inFlightRef.current = false;
    }
  }, [dispatch, loadChats]);

  const stableSocket = useMemo(() => initializeSocketConnection, []);

  return useMemo(() => ({
    handleSendMessage,
    loadChats,
    initializeSocketConnection: stableSocket,
  }), [handleSendMessage, loadChats, stableSocket]);
};

