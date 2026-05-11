import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    chats: [],
    currentChat: null,  
    isloading: false,
    error: null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChats(state, action) {
            state.chats = action.payload;
        },
        setCurrentChatId(state, action) {
            state.currentChat = action.payload;
        },
        setLoading(state, action) {
            state.isloading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        }
    }
});

export const { setChats, setCurrentChatId, setLoading, setError } = chatSlice.actions;
export default chatSlice.reducer; 