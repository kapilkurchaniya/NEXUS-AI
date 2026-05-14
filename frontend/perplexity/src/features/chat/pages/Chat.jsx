import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useImageUpload } from "../hooks/useImageUpload";
import { setCurrentChatId, setMessages } from "../chat.slice";
import { showToast } from "../../auth/components/Toast";

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

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconRetry = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
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
    <div className="relative rounded-xl overflow-hidden mt-3 mb-1" style={{ background: "#0d1117", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
        <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--text-accent)" }}>{lang || "code"}</span>
        <button onClick={onCopy} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors" style={{ color: copied ? "var(--success)" : "var(--text-muted)", background: "rgba(255,255,255,0.04)" }}>
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-[13px] leading-relaxed font-mono" style={{ color: "#e6edf3" }}>{code}</code>
      </pre>
    </div>
  );
}

function renderMarkdown(content) {
  const text = String(content ?? "");
  const parts = [];
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m;

  while ((m = fenceRegex.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, m.index) });
    parts.push({ type: "code", lang: (m[1] || "").trim(), value: m[2] || "" });
    lastIndex = fenceRegex.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });

  return parts.map((p, idx) => {
    if (p.type === "code") return <CodeBlock key={idx} lang={p.lang} code={p.value} />;

    const segments = String(p.value).split(/(`[^`]+`)/g);
    return (
      <div key={idx} className="whitespace-pre-wrap break-words leading-relaxed">
        {segments.map((seg, sIdx) => {
          if (seg.startsWith("`") && seg.endsWith("`")) {
            return (
              <code key={sIdx} className="px-1.5 py-0.5 rounded-md text-[0.9em] font-mono" style={{ background: "rgba(99,102,241,0.1)", color: "var(--text-accent)", border: "1px solid rgba(99,102,241,0.15)" }}>
                {seg.slice(1, -1)}
              </code>
            );
          }
          const boldParts = seg.split(/\*\*(.*?)\*\*/g);
          return (
            <span key={sIdx}>
              {boldParts.map((bp, bIdx) => bIdx % 2 === 1 ? <strong key={bIdx} className="font-semibold">{bp}</strong> : <span key={bIdx}>{bp}</span>)}
            </span>
          );
        })}
      </div>
    );
  });
}

/* ═══════════════════════════════════════════
   Timestamp helper
   ═══════════════════════════════════════════ */
function formatMsgTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ═══════════════════════════════════════════
   Image Thumbnails in Messages
   ═══════════════════════════════════════════ */
function MessageImages({ images, onImageClick }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="msg-images-grid">
      {images.map((img, i) => {
        const src = img.preview || `data:${img.mimeType};base64,${img.data}`;
        return (
          <button key={i} className="msg-image-thumb" onClick={() => onImageClick(src)} type="button">
            <img src={src} alt={img.name || "uploaded"} loading="lazy" />
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Fullscreen Image Modal
   ═══════════════════════════════════════════ */
function ImageModal({ src, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!src) return null;
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose} aria-label="Close"><IconX /></button>
        <img src={src} alt="Full size" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Message Bubble
   ═══════════════════════════════════════════ */
function MessageBubble({ msg, index, onImageClick, onRetry }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const isFailed = msg._failed;

  const onCopyMsg = () => {
    navigator.clipboard.writeText(msg.content || "").then(() => {
      setCopied(true);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`msg-row animate-fade-in-up ${isUser ? "msg-row-user" : "msg-row-ai"}`} style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="msg-avatar msg-avatar-ai">
          <IconBot />
        </div>
      )}

      <div className="msg-bubble-wrap">
        {/* Image thumbnails */}
        <MessageImages images={msg.images} onImageClick={onImageClick} />

        {/* Bubble */}
        <div className={`msg-bubble ${isUser ? "msg-bubble-user" : "msg-bubble-ai"}`}>
          <div className="text-sm">{renderMarkdown(msg.content)}</div>
        </div>

        {/* Actions bar */}
        <div className="msg-actions">
          <span className="msg-timestamp">{formatMsgTime(msg.createdAt)}</span>
          {!isUser && !isFailed && (
            <button className="msg-action-btn" onClick={onCopyMsg} title="Copy response">
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
          )}
          {isFailed && (
            <button className="msg-action-btn msg-retry-btn" onClick={() => onRetry(msg)} title="Retry">
              <IconRetry /> <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="msg-avatar msg-avatar-user">
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
    <div className="msg-row msg-row-ai animate-fade-in">
      <div className="msg-avatar msg-avatar-ai msg-avatar-pulse">
        <IconBot />
      </div>
      <div className="msg-bubble msg-bubble-ai">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent)" }} />
            <span className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent)" }} />
            <span className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent)" }} />
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Thinking…</span>
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
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "var(--accent-glow)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Start a conversation</h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Type a message or drop an image to begin chatting with AI.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Image Preview Strip (above composer)
   ═══════════════════════════════════════════ */
function ImagePreviewStrip({ images, onRemove }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="image-preview-strip">
      {images.map((img, i) => (
        <div key={i} className="image-preview-item">
          <img src={img.preview} alt={img.name} />
          <button className="image-preview-remove" onClick={() => onRemove(i)} aria-label="Remove image"><IconX /></button>
        </div>
      ))}
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
  const imageUpload = useImageUpload();

  const [input, setInput] = useState("");
  const [localSending, setLocalSending] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const chatTitle = useMemo(() => {
    if (!chatId) return "New Chat";
    const found = chats.find((c) => c._id === chatId);
    return found?.title || "Chat";
  }, [chatId, chats]);

  // Init socket once
  useEffect(() => { initializeSocketConnection(); }, []);

  // Load messages when chatId changes
  useEffect(() => {
    if (chatId) {
      dispatch(setCurrentChatId(chatId));
      loadMessages(chatId);
    } else {
      dispatch(setMessages([]));
    }
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
    const imgs = imageUpload.images;
    if (!text && imgs.length === 0) return;

    setLocalSending(true);
    setInput("");
    imageUpload.clearImages();

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await handleSendMessage({
        chatId: chatId || null,
        message: text || "📷 Image",
        images: imgs.map(({ data, mimeType, name }) => ({ data, mimeType, name })),
      });

      if (res?.chatId && !chatId) {
        dispatch(setCurrentChatId(res.chatId));
        navigate(`/chat/${res.chatId}`, { replace: true });
      }
    } catch {
      // Error handled in useChat
    } finally {
      setLocalSending(false);
    }
  }, [input, chatId, localSending, isloading, handleSendMessage, navigate, dispatch, imageUpload]);

  // Retry failed message
  const onRetry = useCallback(async (msg) => {
    if (localSending || isloading) return;
    setLocalSending(true);
    try {
      await handleSendMessage({
        chatId: chatId || null,
        message: msg.content,
        images: msg.images || [],
      });
    } catch { /* handled */ } finally {
      setLocalSending(false);
    }
  }, [chatId, localSending, isloading, handleSendMessage]);

  const isBusy = isloading || localSending;

  return (
    <div
      className="flex flex-col h-screen"
      onDragEnter={imageUpload.onDragEnter}
      onDragOver={imageUpload.onDragOver}
      onDragLeave={imageUpload.onDragLeave}
      onDrop={imageUpload.onDrop}
    >
      {/* Drag overlay */}
      {imageUpload.isDragging && (
        <div className="image-drop-zone">
          <div className="image-drop-zone-inner">
            <IconImage />
            <span>Drop images here</span>
          </div>
        </div>
      )}

      {/* Fullscreen modal */}
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />

      {/* Hidden file input */}
      <input
        ref={imageUpload.fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        multiple
        style={{ display: "none" }}
        onChange={imageUpload.onFileInputChange}
      />

      {/* ── Header ── */}
      <header className="chat-header">
        {chatId && (
          <button onClick={() => navigate("/home")} className="chat-back-btn lg:hidden" aria-label="Back to home" id="chat-back-button">
            <IconBack />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }} id="chat-title">{chatTitle}</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{isBusy ? "AI is thinking…" : chatId ? "Active thread" : "New conversation"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: isBusy ? "var(--warning)" : "var(--success)" }} />
          <span className="text-xs hidden sm:inline" style={{ color: "var(--text-muted)" }}>{isBusy ? "Processing" : "Ready"}</span>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5 pb-4">
          {messages.length === 0 && !isBusy ? (
            <EmptyChatState />
          ) : (
            messages.map((m, idx) => (
              <MessageBubble
                key={`${m._id || idx}-${idx}`}
                msg={m}
                index={idx}
                onImageClick={setModalImage}
                onRetry={onRetry}
              />
            ))
          )}

          {isBusy && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Composer ── */}
      <div className="composer-area">
        <div className="composer-container">
          {/* Image previews */}
          <ImagePreviewStrip images={imageUpload.images} onRemove={imageUpload.removeImage} />

          {/* Error message */}
          {imageUpload.error && (
            <div className="composer-error">{imageUpload.error}</div>
          )}

          <div className="composer-row">
            {/* Image upload button */}
            <button
              className="composer-icon-btn"
              onClick={imageUpload.openFilePicker}
              disabled={isBusy}
              title="Upload image"
              type="button"
            >
              <IconImage />
            </button>

            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              onPaste={imageUpload.onPaste}
              rows={1}
              className="composer-textarea"
              placeholder="Type a message or paste an image…"
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
              disabled={isBusy || (!input.trim() && imageUpload.images.length === 0)}
              className="composer-send-btn"
              style={{
                background: isBusy ? "var(--bg-elevated)" : "var(--accent-gradient)",
                color: isBusy ? "var(--text-muted)" : "#fff",
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

          <div className="composer-hints">
            <span>Shift+Enter for new line & Paste or drop images</span>
            <span style={{ color: "var(--text-accent)" }}>{chatId ? "Thread" : "New chat"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
