import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentChatId, setSidebarOpen } from "../chat.slice";

/* ── Icons (inline SVG) ── */
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/* ── Helpers ── */
function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function truncate(str, len = 48) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

/* ── Skeleton Loader ── */
function ChatSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl px-3 py-3"
          style={{ opacity: 1 - i * 0.12 }}
        >
          <div className="w-8 h-8 rounded-lg animate-shimmer flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 w-28 rounded animate-shimmer" />
            <div className="h-2 w-full rounded animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div className="px-4 py-8 text-center">
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: "var(--accent-glow)", border: "1px solid var(--border)" }}
      >
        <IconChat />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        No conversations yet
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        Start a new chat to begin
      </p>
    </div>
  );
}

/* ── Chat Item ── */
function ChatItem({ chat, isActive, onSelect, onDelete }) {
  const title = chat?.title || "New Chat";
  const preview = chat?.lastMessage || chat?.title || "New conversation";
  const ts = formatTimestamp(chat?.updatedAt || chat?.createdAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chat._id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(chat._id)}
      className="group relative flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200"
      style={{
        background: isActive ? "var(--accent-glow)" : "transparent",
        border: isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
        color: "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--bg-surface-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
        style={{
          background: isActive ? "var(--accent)" : "var(--bg-surface)",
          color: isActive ? "#fff" : "var(--text-accent)",
          border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
        }}
      >
        <IconChat />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{truncate(title, 28)}</span>
          <span
            className="text-[11px] whitespace-nowrap flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {ts}
          </span>
        </div>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {truncate(preview, 40)}
        </p>
      </div>

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(chat._id);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
        style={{
          background: "var(--bg-surface)",
          color: "var(--danger)",
          border: "1px solid var(--border)",
        }}
        title="Delete chat"
        aria-label="Delete chat"
      >
        <IconTrash />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   SIDEBAR COMPONENT
   ══════════════════════════════════════════ */
export default function Sidebar({ isLoading }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chatId } = useParams();

  const { chats, sidebarOpen } = useSelector((s) => s.chat);
  const user = useSelector((s) => s.auth.user);

  const chatList = useMemo(() => (Array.isArray(chats) ? chats : []), [chats]);

  const onSelectChat = (id) => {
    dispatch(setCurrentChatId(id));
    dispatch(setSidebarOpen(false));
    navigate(`/chat/${id}`);
  };

  const onNewChat = () => {
    dispatch(setSidebarOpen(false));
    navigate("/home");
  };

  const onDeleteChat = (id) => {
    // Handled by parent via useChat — but we dispatch inline for simplicity
    // The actual delete is done via useChat.handleDeleteChat in Layout
    const event = new CustomEvent("delete-chat", { detail: id });
    window.dispatchEvent(event);
  };

  const closeSidebar = () => dispatch(setSidebarOpen(false));
  const openSidebar = () => dispatch(setSidebarOpen(true));

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header / User */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--accent-gradient)", color: "#fff" }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {user?.username || "User"}
            </div>
            <div className="text-xs" style={{ color: "var(--text-accent)" }}>
              Pro Plan
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: "var(--accent-gradient)",
            color: "#fff",
            border: "none",
            boxShadow: "var(--shadow-glow)",
          }}
          id="new-chat-button"
        >
          <IconPlus />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        <div
          className="text-[10px] font-semibold tracking-[0.12em] uppercase px-3 mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Recent Conversations
        </div>

        {isLoading ? (
          <ChatSkeleton />
        ) : chatList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0.5">
            {chatList.map((c) => (
              <ChatItem
                key={c._id}
                chat={c}
                isActive={chatId === c._id}
                onSelect={onSelectChat}
                onDelete={onDeleteChat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: "var(--success)" }}
          />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            System Online
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        onClick={openSidebar}
        className="fixed top-4 left-4 z-40 w-10 h-10 rounded-xl flex items-center justify-center lg:hidden transition-all duration-200"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Open sidebar"
        id="sidebar-toggle"
      >
        <IconMenu />
      </button>

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0"
        style={{
          width: "var(--sidebar-width)",
          minWidth: "var(--sidebar-width)",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile / Tablet drawer overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 sidebar-overlay"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={closeSidebar}
          />

          {/* Drawer */}
          <div
            className="absolute left-0 top-0 bottom-0 flex flex-col sidebar-drawer"
            style={{
              width: "min(300px, 85vw)",
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Close button */}
            <div className="flex justify-end px-3 pt-3">
              <button
                onClick={closeSidebar}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
                aria-label="Close sidebar"
              >
                <IconClose />
              </button>
            </div>

            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export { IconMenu, IconPlus };
