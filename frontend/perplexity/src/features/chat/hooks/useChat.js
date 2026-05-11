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

export const useChat = () => {

  const dispatch = useDispatch();

  async function handleSendMessage({ chatId, message }) {

    try {

      dispatch(setLoading(true));

      await sendMessage(chatId, message);

      const chats = await getChats();

      dispatch(setChats(chats));

    } catch (error) {

      dispatch(
        setError(error.message || "Failed to send message")
      );

    } finally {

      dispatch(setLoading(false));
    }
  }

  return {
    handleSendMessage,
    initializeSocketConnection
  };
};