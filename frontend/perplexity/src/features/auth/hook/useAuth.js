import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../services/auth.api";
import { setUser, setError, setLoading, setChecked, clearAuth } from "../auth.slice";
import { resetChat } from "../../chat/chat.slice";
import { disconnectSocket } from "../../chat/sevices/chat.socket";
import { showToast } from "../components/Toast";

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

const handleLogout = useCallback(async () => {
    try {
        // Call server to clear httpOnly cookie
        await logout();

        // Disconnect active socket connection
        disconnectSocket();

        // Clear Redux state
        dispatch(clearAuth());
        dispatch(resetChat());

        // Clear any localStorage/sessionStorage data
        localStorage.clear();
        sessionStorage.clear();

        // Show success toast
        showToast("Logged out successfully", "success");

        // Use replace to prevent back-button navigation to protected pages
        // Small delay to let the toast be seen
        setTimeout(() => {
            window.location.replace("/");
        }, 800);
    } catch (err) {
        // Even if server call fails, still clear client-side state
        disconnectSocket();
        dispatch(clearAuth());
        dispatch(resetChat());
        localStorage.clear();
        sessionStorage.clear();

        showToast(err.message || "Logout encountered an error, but session cleared", "error");

        setTimeout(() => {
            window.location.replace("/");
        }, 1200);
    }
}, [dispatch]);

return { handleRegister, handleLogin, handleGetMe, handleLogout };
}


