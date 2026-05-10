import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
        checked: false,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;   
        },
        setChecked: (state, action) => {
            state.checked = action.payload;
        },
    }
});

export const { setUser, setLoading, setError, setChecked } = authSlice.actions;
export default authSlice.reducer;