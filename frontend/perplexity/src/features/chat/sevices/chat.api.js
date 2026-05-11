import axios from "axios";

const api = axios.create({
    baseURL : "http://localhost:3000",
    withCredentials: true
});

export async function sendMessage(chatId, message) {
    const response = await api.post(`/api/chat/message`, { chatId, message }); 
    return response.data;
}

export async function getChats() {
    const response = await api.get(`/api/chat/`); 
    return response.data;
}

export async function getMessages(chatId) {
    const response = await api.get(`/api/chat/${chatId}/messages`); 
    return response.data;
}

export async function deleteChat(chatId) {
    const response = await api.delete(`/api/chat/delete/${chatId}`); 
    return response.data;
}

