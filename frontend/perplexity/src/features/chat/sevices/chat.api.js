import axios from "axios";

const api = axios.create({
  // VITE_API_BASE is expected to be your backend origin, e.g. "http://localhost:3000"
  baseURL: "http://localhost:3000",
  withCredentials: true,
  timeout: 45000, // 45s timeout — slightly longer than backend's 30s AI timeout
});

export async function sendMessage(chatId, message, images = []) {
  try {
    const response = await api.post(`/api/chat/message`, { chatId, message, images });
    return response.data;
  } catch (error) {
    // Extract the server's error message instead of generic axios error
    const serverMessage =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Request timed out. Please try again."
        : "Failed to send message. Please check your connection.");

    const enhancedError = new Error(serverMessage);
    enhancedError.status = error.response?.status || 0;
    enhancedError.retryAfter = error.response?.data?.retryAfter || null;
    throw enhancedError;
  }
}

export async function getChats() {
  const response = await api.get(`/api/chat/`);
  // API returns { success, chats } — extract the chats array
  return response.data?.chats ?? response.data ?? [];
}

export async function getMessages(chatId) {
  const response = await api.get(`/api/chat/${chatId}/messages`);
  return response.data;
}

export async function deleteChat(chatId) {
  const response = await api.delete(`/api/chat/delete/${chatId}`);
  return response.data;
}
