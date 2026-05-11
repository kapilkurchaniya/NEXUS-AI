import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';
import { getMessages } from '../sevices/chat.api';

const roleLabel = {
  user: 'You',
  ai: 'Assistant',
};

function renderMarkdownToNodes(content) {
  const text = String(content ?? '');

  // Split by fenced code blocks ```lang?\n...\n```
  const parts = [];
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m;

  while ((m = fenceRegex.exec(text)) !== null) {
    const start = m.index;
    const end = fenceRegex.lastIndex;

    if (start > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, start) });
    }

    parts.push({
      type: 'code',
      lang: (m[1] || '').trim(),
      value: m[2] || '',
    });

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.map((p, idx) => {
    if (p.type === 'code') {
      return (
        <pre
          key={idx}
          className="mt-3 rounded-xl bg-[#0b1228] border border-[#232946] p-4 overflow-x-auto shadow-sm"
        >
          {p.lang ? (
            <div className="text-[11px] text-[#7f9cf5] mb-2 font-semibold">
              {p.lang}
            </div>
          ) : null}
          <code className="text-sm text-[#e5e9f7] font-mono">{p.value}</code>
        </pre>
      );
    }

    // Inline code `...`
    const segments = String(p.value).split(/(`[^`]+`)/g);
    return (
      <div key={idx} className="whitespace-pre-wrap break-words">
        {segments.map((seg, sIdx) => {
          if (seg.startsWith('`') && seg.endsWith('`')) {
            const inner = seg.slice(1, -1);
            return (
              <code
                key={sIdx}
                className="px-2 py-1 rounded-lg bg-[#181f36] border border-[#232946] text-[#e5e9f7] font-mono text-[0.92em]"
              >
                {inner}
              </code>
            );
          }
          return <span key={sIdx}>{seg}</span>;
        })}
      </div>
    );
  });
}

function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { handleSendMessage, initializeSocketConnection } = useChat();
  const { isloading, error } = useSelector((s) => s.chat);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [localSending, setLocalSending] = useState(false);

  const bottomRef = useRef(null);

  const headerTitle = useMemo(() => {
    if (chatId) return `Chat ${String(chatId).slice(-6)}`;
    return 'New Chat';
  }, [chatId]);

  useEffect(() => {
    initializeSocketConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!chatId) return;
      try {
        const res = await getMessages(chatId);
        if (!mounted) return;
        setMessages(res.messages || res || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();

    return () => {
      mounted = false;
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isloading]);

  async function onSend() {
    if (localSending) return;

    const text = input.trim();
    if (!text) return;

    setLocalSending(true);

    // optimistic user message
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');

    try {
      const res = await handleSendMessage({ chatId: chatId || null, message: text });

      // First message: navigate to the created chatId so Home sidebar/title updates
      if (res?.chatId && !chatId) {
        navigate(`/chat/${res.chatId}`);
      }

      if (res?.message) {
        setMessages((prev) => [...prev, { role: 'ai', content: res.message }]);
      }

      const finalChatId = chatId || res?.chatId;
      if (finalChatId) {
        const res2 = await getMessages(finalChatId);
        setMessages(res2.messages || res2 || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocalSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1020] text-white flex">
      <aside className="hidden lg:block w-80 bg-[#151a2b] border-r border-[#232946]">
        <div className="p-6">
          <div className="text-xs text-[#bfc9d9] font-semibold mb-4 tracking-widest">
            CONVERSATION
          </div>
          <div className="text-lg font-semibold">{headerTitle}</div>
          {error ? <div className="mt-4 text-sm text-red-400">{error}</div> : null}
          <div className="mt-6">
            <button
              className="w-full bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition"
              onClick={() => navigate('/home')}
            >
              Back
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* Sticky header */}
        <div className="px-4 md:px-6 py-4 border-b border-[#232946] bg-[#0a1020] sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-[#bfc9d9]">AI Chat</div>
              <div className="text-lg font-semibold">{chatId ? 'Thread' : 'Start a conversation'}</div>
            </div>
            <div className="hidden md:block text-xs text-[#7f9cf5] font-semibold">
              {isloading ? 'Typing…' : 'Ready'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4 pb-24">
            {messages.length === 0 ? (
              <div className="text-[#7f9cf5] bg-[#151a2b] border border-[#232946] rounded-xl p-6">
                <div className="font-semibold mb-1">Ask anything</div>
                <div className="text-sm text-[#bfc9d9]">Send a message to see user + assistant replies.</div>
              </div>
            ) : null}

            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      isUser
                        ? 'max-w-[92%] md:max-w-[80%] bg-[#7f9cf5] text-[#151a2b] rounded-2xl rounded-br-md px-4 py-3 shadow'
                        : 'max-w-[92%] md:max-w-[80%] bg-[#181f36] text-white border border-[#232946] rounded-2xl rounded-bl-md px-4 py-3 shadow'
                    }
                  >
                    <div className="text-xs opacity-80 mb-2">{roleLabel[m.role] || m.role}</div>
                    <div className="text-sm leading-relaxed">
                      {renderMarkdownToNodes(m.content)}
                    </div>
                  </div>
                </div>
              );
            })}

            {isloading ? (
              <div className="flex justify-start">
                <div className="max-w-[92%] md:max-w-[80%] bg-[#181f36] border border-[#232946] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="text-xs opacity-80 mb-2">Assistant</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#7f9cf5] animate-bounce" />
                    <span className="inline-block w-2 h-2 rounded-full bg-[#7f9cf5] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="inline-block w-2 h-2 rounded-full bg-[#7f9cf5] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-sm text-[#bfc9d9]">Thinking…</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="p-4 md:p-4 border-t border-[#232946] bg-[#0a1020]">
          <div className="max-w-3xl mx-auto bg-[#181f36] rounded-2xl border border-[#232946] px-3 md:px-4 py-3">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-white placeholder-[#bfc9d9] text-base leading-relaxed py-2"
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />

              <button
                className="bg-[#7f9cf5] hover:bg-[#5a6fdc] text-[#151a2b] font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSend}
                disabled={isloading || localSending}
              >
                {isloading || localSending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#151a2b] border-t-transparent animate-spin" />
                    Sending…
                  </span>
                ) : (
                  'Send'
                )}
              </button>
            </div>

            <div className="mt-2 text-xs text-[#bfc9d9] flex justify-between">
              <span>Tip: Shift+Enter for a new line</span>
              <span className="text-[#7f9cf5] font-semibold">{chatId ? 'Thread' : 'New chat'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;


