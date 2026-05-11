import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hooks/useChat";
import { setCurrentChatId, setMessages } from "../chat.slice";

/* ── Icons ── */
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ═══════════════════════════════════════════
   Markdown Renderer
   ═══════════════════════════════════════════ */
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden mt-3 mb-1"
      style={{ background: "#0d1117", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--text-accent)" }}>
          {lang || "code"}
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors"
          style={{
            color: copied ? "var(--success)" : "var(--text-muted)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-[13px] leading-relaxed font-mono" style={{ color: "#e6edf3" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function renderMarkdown(content) {
  const text = String(content ?? "");

  // Split by fenced code blocks
  const parts = [];
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m;

  while ((m = fenceRegex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, m.index) });
    }
    parts.push({ type: "code", lang: (m[1] || "").trim(), value: m[2] || "" });
    lastIndex = fenceRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.map((p, idx) => {
    if (p.type === "code") {
      return <CodeBlock key={idx} lang={p.lang} code={p.value} />;
    }

    // Process inline formatting
    const segments = String(p.value).split(/(`[^`]+`)/g);
    return (
      <div key={idx} className="whitespace-pre-wrap break-words leading-relaxed">
        {segments.map((seg, sIdx) => {
          if (seg.startsWith("`") && seg.endsWith("`")) {
            const inner = seg.slice(1, -1);
            return (
              <code
                key={sIdx}
                className="px-1.5 py-0.5 rounded-md text-[0.9em] font-mono"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  color: "var(--text-accent)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                {inner}
              </code>
            );
          }
          // Bold
          const boldParts = seg.split(/\*\*(.*?)\*\*/g);
          return (
            <span key={sIdx}>
              {boldParts.map((bp, bIdx) =>
                bIdx % 2 === 1 ? (
                  <strong key={bIdx} className="font-semibold">
                    {bp}
                  </strong>
                ) : (
                  <span key={bIdx}>{bp}</span>
                )
              )}
            </span>
          );
        })}
      </div>
    );
  });
}

/* ═══════════════════════════════════════════
   Message Bubble
   ═══════════════════════════════════════════ */
function MessageBubble({ msg, index }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex gap-3 animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
          style={{
            background: "var(--accent-gradient)",
            color: "#fff",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <IconBot />
        </div>
      )}

      {/* Bubble */}
      <div
        className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3"
        style={{
          background: isUser ? "var(--accent-gradient)" : "var(--bg-surface)",
          color: isUser ? "#fff" : "var(--text-primary)",
          border: isUser ? "none" : "1px solid var(--border)",
          borderBottomRightRadius: isUser ? "6px" : "16px",
          borderBottomLeftRadius: isUser ? "16px" : "6px",
          boxShadow: isUser ? "var(--shadow-glow)" : "var(--shadow-sm)",
        }}
      >
        <div className="text-sm">{renderMarkdown(msg.content)}</div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-accent)",
            border: "1px solid var(--border)",
          }}
        >
          <IconUser />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Typing Indicator
   ═══════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: "var(--accent-gradient)",
          color: "#fff",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <IconBot />
      </div>
      <div
        className="rounded-2xl px-5 py-4"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderBottomLeftRadius: "6px",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full typing-dot"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="w-2 h-2 rounded-full typing-dot"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="w-2 h-2 rounded-full typing-dot"
            style={{ background: "var(--accent)" }}
          />
          <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
            Thinking…
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Empty Chat State
   ═══════════════════════════════════════════ */
function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm animate-fade-in-up">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{
            background: "var(--accent-glow)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--accent)" }}
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Start a conversation
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Type a message below to begin chatting with AI. Your conversation will be saved automatically.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHAT PAGE
   ═══════════════════════════════════════════ */
function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { handleSendMessage, loadMessages, initializeSocketConnection } = useChat();
  const { messages, isloading, chats } = useSelector((s) => s.chat);

  const [input, setInput] = useState("");
  const [localSending, setLocalSending] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Get the current chat title from the chats list
  const chatTitle = useMemo(() => {
    if (!chatId) return "New Chat";
    const found = chats.find((c) => c._id === chatId);
    return found?.title || "Chat";
  }, [chatId, chats]);

  // Init socket once
  useEffect(() => {
    initializeSocketConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when chatId changes
  useEffect(() => {
    if (chatId) {
      dispatch(setCurrentChatId(chatId));
      loadMessages(chatId);
    } else {
      dispatch(setMessages([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isloading]);

  // Auto-resize textarea
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, []);

  // Send message
  const onSend = useCallback(async () => {
    if (localSending || isloading) return;
    const text = input.trim();
    if (!text) return;

    setLocalSending(true);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await handleSendMessage({ chatId: chatId || null, message: text });

      // First message creates a new chat — navigate to it
      if (res?.chatId && !chatId) {
        dispatch(setCurrentChatId(res.chatId));
        navigate(`/chat/${res.chatId}`, { replace: true });
      }
    } catch {
      // Error handled in useChat
    } finally {
      setLocalSending(false);
    }
  }, [input, chatId, localSending, isloading, handleSendMessage, navigate, dispatch]);

  const isBusy = isloading || localSending;

  return (
    <div className="flex flex-col h-screen">
      {/* ── Header ── */}
      <header
        className="flex items-center gap-3 px-4 md:px-6 shrink-0"
        style={{
          height: "var(--header-height)",
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Back button (mobile only — when in a chat) */}
        {chatId && (
          <button
            onClick={() => navigate("/home")}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              marginLeft: "36px",
            }}
            aria-label="Back to home"
            id="chat-back-button"
          >
            <IconBack />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
            id="chat-title"
          >
            {chatTitle}
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {isBusy ? "AI is thinking…" : chatId ? "Active thread" : "New conversation"}
          </p>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: isBusy ? "var(--warning)" : "var(--success)" }}
          />
          <span className="text-xs hidden sm:inline" style={{ color: "var(--text-muted)" }}>
            {isBusy ? "Processing" : "Ready"}
          </span>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5 pb-4">
          {messages.length === 0 && !isBusy ? (
            <EmptyChatState />
          ) : (
            messages.map((m, idx) => (
              <MessageBubble key={`${m._id || idx}-${idx}`} msg={m} index={idx} />
            ))
          )}

          {isBusy && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Composer ── */}
      <div
        className="shrink-0 px-4 md:px-6 py-3"
        style={{
          background: "var(--bg-primary)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="max-w-3xl mx-auto rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed py-1.5"
              style={{
                color: "var(--text-primary)",
                caretColor: "var(--accent)",
                maxHeight: "160px",
              }}
              placeholder="Type your message…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={isBusy}
            />

            <button
              id="chat-send-button"
              onClick={onSend}
              disabled={isBusy || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: isBusy ? "var(--bg-elevated)" : "var(--accent-gradient)",
                color: isBusy ? "var(--text-muted)" : "#fff",
                border: "none",
                boxShadow: isBusy ? "none" : "var(--shadow-glow)",
              }}
            >
              {isBusy ? (
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
              ) : (
                <IconSend />
              )}
            </button>
          </div>

          <div
            className="flex items-center justify-between mt-2 text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Shift+Enter for new line</span>
            <span style={{ color: "var(--text-accent)" }}>
              {chatId ? "Thread" : "New chat"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
