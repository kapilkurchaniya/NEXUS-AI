import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router";
import { useChat } from "../hooks/useChat";
import Sidebar from "./Sidebar";

/**
 * Layout — shared wrapper for /home and /chat/:chatId
 * Renders the persistent sidebar + <Outlet /> for the active page.
 */
export default function Layout() {
  const { loadChats, handleDeleteChat, initializeSocketConnection } = useChat();
  const [isChatsLoading, setIsChatsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        initializeSocketConnection();
        setIsChatsLoading(true);
        await loadChats();
      } catch {
        // keep UI stable
      } finally {
        if (mounted) setIsChatsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for delete-chat custom events dispatched from Sidebar
  const onDeleteEvent = useCallback(
    async (e) => {
      const chatId = e.detail;
      if (chatId) {
        await handleDeleteChat(chatId);
      }
    },
    [handleDeleteChat]
  );

  useEffect(() => {
    window.addEventListener("delete-chat", onDeleteEvent);
    return () => window.removeEventListener("delete-chat", onDeleteEvent);
  }, [onDeleteEvent]);

  return (
    <div className="app-layout">
      <Sidebar isLoading={isChatsLoading} />

      {/* Main content — fills remaining width */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
