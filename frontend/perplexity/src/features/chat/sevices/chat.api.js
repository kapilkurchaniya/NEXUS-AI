import axios from "axios";

const api = axios.create({
  // Deployed backend URL (Vercel)
  // If you set VITE_API_BASE in Vercel, it will override this value.
  baseURL: import.meta.env.VITE_API_BASE ?? "https://nexus-ai-two-snowy.vercel.app",
  withCredentials: true,
});


export async function sendMessage(chatId, message, images = []) {
  const response = await api.post(`/api/chat/message`, { chatId, message, images });
  return response.data;
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
