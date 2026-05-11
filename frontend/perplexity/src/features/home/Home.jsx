import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useChat } from "../chat/hooks/useChat";
import { setCurrentChatId, addMessage, setMessages } from "../chat/chat.slice";

/* ── Icons ── */
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconSpark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ── Quick-action cards config ── */
const quickActions = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    label: "Summarize an article",
    color: "#22c55e",
    prompt: "Summarize this article for me: ",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    label: "Write a code snippet",
    color: "#6366f1",
    prompt: "Write a code snippet for: ",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    label: "Analyze dataset",
    color: "#f59e0b",
    prompt: "Help me analyze this dataset: ",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    label: "Debug an error",
    color: "#ef4444",
    prompt: "Help me debug this error: ",
  },
];

/* ── Greeting helper ── */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ══════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════ */
function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleSendMessage } = useChat();
  const user = useSelector((s) => s.auth.user);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);

  const onCreateChat = async (text) => {
    const trimmed = (text || message).trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setMessage("");

    // Clear old messages and set optimistic user message
    dispatch(setMessages([]));
    dispatch(addMessage({ role: "user", content: trimmed }));

    try {
      const res = await handleSendMessage({ chatId: null, message: trimmed });
      const newChatId = res?.chatId;
      if (newChatId) {
        dispatch(setCurrentChatId(newChatId));
        navigate(`/chat/${newChatId}`);
      } else {
        navigate("/chat");
      }
    } catch {
      // Error handled in useChat
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-screen">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Hero */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "var(--accent-glow)",
              color: "var(--text-accent)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <IconSpark />
            Powered by AI
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {greeting}
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>

          <p
            className="text-base md:text-lg max-w-md mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            {user?.username ? `Hi ${user.username}, w` : "W"}hat would you like to explore today?
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div
            className="relative glass rounded-2xl overflow-hidden transition-all duration-300"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--accent)" }}
            >
              <IconSearch />
            </div>

            <input
              id="home-search-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent text-base py-4 pl-12 pr-14 outline-none"
              style={{
                color: "var(--text-primary)",
                caretColor: "var(--accent)",
              }}
              placeholder="Ask anything…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onCreateChat();
                }
              }}
              disabled={isSending}
            />

            <button
              onClick={() => onCreateChat()}
              disabled={isSending || !message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: "var(--accent-gradient)",
                color: "#fff",
                border: "none",
              }}
              id="home-send-button"
            >
              {isSending ? (
                <span
                  className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block"
                />
              ) : (
                <IconArrow />
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMessage(action.prompt);
                // Focus the input
                document.getElementById("home-search-input")?.focus();
              }}
              className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-surface-hover)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-surface)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{
                  background: `${action.color}15`,
                  color: action.color,
                  border: `1px solid ${action.color}25`,
                }}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--text-muted)" }}
        >
          Press Enter to send · Responses powered by Gemini AI
        </p>
      </div>
    </div>
  );
}

export default Home;
