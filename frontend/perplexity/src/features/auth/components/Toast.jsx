import { useState, useEffect, useCallback } from "react";

/* ── Toast event system (no external deps) ── */
const TOAST_EVENT = "app-toast";

/**
 * Call from anywhere to show a toast notification.
 * @param {string} message
 * @param {"success"|"error"|"info"} type
 */
export function showToast(message, type = "info") {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { message, type, id: Date.now() } })
  );
}

/* ── Icons ── */
const SuccessIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const iconMap = { success: <SuccessIcon />, error: <ErrorIcon />, info: <InfoIcon /> };

const colorMap = {
  success: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#4ade80", bar: "#22c55e" },
  error:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  color: "#f87171", bar: "#ef4444" },
  info:    { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)", color: "#a5b4fc", bar: "#6366f1" },
};

const DURATION = 3500;

/* ── Single Toast Item ── */
function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const colors = colorMap[toast.type] || colorMap.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`toast-item ${exiting ? "toast-exit" : "toast-enter"}`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      role="alert"
    >
      <div className="toast-icon" style={{ color: colors.color }}>
        {iconMap[toast.type]}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="toast-progress" style={{ background: colors.bar }} />
    </div>
  );
}

/* ── Toast Container (mount once in App) ── */
export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const handleToastEvent = useCallback((e) => {
    setToasts((prev) => [...prev, e.detail]);
  }, []);

  useEffect(() => {
    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
  }, [handleToastEvent]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
