import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {register , login , getMe} from "../services/auth.api"; 
import { setUser,setError,setLoading, setChecked } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    const handleRegister = useCallback(async ({ email, username, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await register({ email, username, password });
            dispatch(setUser(data.user));
        } catch (err) {
            dispatch(setError(err.message || 'Registration failed'));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

const handleLogin = useCallback(async ({ email, password }) => {
    try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const data = await login({ email, password });

        dispatch(setUser(data.user));
    } catch (err) {
        dispatch(setError(err.message || 'Login failed'));
        throw err;
    } finally {
        dispatch(setLoading(false));
    }
}, [dispatch]);

const handleGetMe = useCallback(async () => {
    try {
        dispatch(setChecked(false));
        dispatch(setLoading(true));
        dispatch(setError(null));
        const data = await getMe();
        dispatch(setUser(data.user || data.User));
    } catch (err) {
        dispatch(setError(err.message || 'Failed to get user data'));
        throw err;
    } finally {
        dispatch(setLoading(false));
        dispatch(setChecked(true));
    }
}, [dispatch]);

return { handleRegister, handleLogin, handleGetMe };
}


