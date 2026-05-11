import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useChat } from '../chat/hooks/useChat';
import { useLocation, useNavigate, useParams } from 'react-router';

import { setCurrentChatId } from '../chat/chat.slice';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams();
  const dispatch = useDispatch();

  const chat = useChat();
  const { chats } = useSelector((s) => s.chat);

  const [message, setMessage] = useState('');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const activeChatId = useMemo(() => {
    if (location.pathname.startsWith('/chat/') && chatId) return chatId;
    return null;
  }, [location.pathname, chatId]);

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.loadChats?.().catch(() => {});
    // run once on mount to avoid re-calling /api/chat continuously
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const onSelectChat = (id) => {
    dispatch(setCurrentChatId(id));
    setIsChatDrawerOpen(false);
    navigate(`/chat/${id}`);
  };

  const onCreateChatFromSearch = async () => {
    const text = message.trim();
    if (!text) return;

    const res = await chat.handleSendMessage({ chatId: null, message: text });
    setMessage('');

    const newChatId = res?.chatId;
    if (newChatId) onSelectChat(newChatId);
    else navigate('/chat');
  };

  return (
    <div className="min-h-screen flex bg-[#0a1020] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-80 bg-[#151a2b] flex-col justify-between py-6 px-5 min-h-screen border-r border-[#232946] sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#232946]"
            />
            <div>
              <div className="font-semibold text-lg">Analytical Pilot</div>
              <div className="text-xs text-[#7f9cf5]">Pro Plan</div>
            </div>
          </div>

          <button
            className="w-full bg-[#7f9cf5] hover:bg-[#5a6fdc] text-[#151a2b] font-semibold py-3 rounded-xl mb-8 transition text-lg flex items-center justify-center gap-2"
            onClick={() => navigate('/chat')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          <div>
            <div className="text-xs text-[#bfc9d9] font-semibold mb-2 tracking-widest">RECENT THREADS</div>
            <ul className="space-y-2">
              {Array.isArray(chats) &&
                chats.map((c) => {
                  const isActive = activeChatId === c?._id;
                  const lastPreview = c?.lastMessage || c?.title || 'New conversation';

                  return (
                    <li
                      key={c?._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectChat(c?._id)}
                      onKeyDown={(e) => e.key === 'Enter' && onSelectChat(c?._id)}
                      className={`flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition ${
                        isActive ? 'bg-[#232946] border border-[#7f9cf5]' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#181f36] border border-[#232946] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#7f9cf5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c?.title || 'New Chat'}</div>
                        <div className="truncate text-xs text-[#bfc9d9] opacity-90">{lastPreview}</div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="mt-8">
            <div className="text-xs text-[#bfc9d9] font-semibold mb-2 tracking-widest">WORKSPACE</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition">
                <svg className="w-5 h-5 text-[#bfc9d9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7h18" />
                </svg>
                <span className="truncate text-sm">Collections</span>
              </li>
              <li className="flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition">
                <svg className="w-5 h-5 text-[#bfc9d9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="truncate text-sm">Settings</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#181f36] rounded-xl px-4 py-2 mt-8">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
          <span className="text-sm text-[#bfc9d9]">System Status</span>
          <span className="ml-auto text-green-400 text-sm font-semibold">Online</span>
        </div>
      </aside>

      {/* Tablet placeholder (structure preserved) */}
      <div className="hidden md:block lg:hidden w-[320px]">
        {/* reserved */}
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <button
          className="fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-[#181f36] border border-[#232946] flex items-center justify-center"
          onClick={() => setIsChatDrawerOpen(true)}
          aria-label="Open chat sidebar"
        >
          <svg className="w-6 h-6 text-[#bfc9d9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isChatDrawerOpen ? (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatDrawerOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#151a2b] border-r border-[#232946] p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="font-semibold">Chats</div>
                <button
                  className="w-10 h-10 rounded-xl bg-[#181f36] border border-[#232946] flex items-center justify-center"
                  onClick={() => setIsChatDrawerOpen(false)}
                >
                  <svg className="w-5 h-5 text-[#bfc9d9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ul className="space-y-2">
                {Array.isArray(chats) &&
                  chats.map((c) => {
                    const isActive = activeChatId === c?._id;

                    return (
                      <li
                        key={c?._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectChat(c?._id)}
                        className={`flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition ${
                          isActive ? 'bg-[#232946] border border-[#7f9cf5]' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#181f36] border border-[#232946] flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#7f9cf5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{c?.title || 'New Chat'}</div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-xl text-left mb-8 mt-8 md:mt-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-[#e5e9f7]">
            Good evening<span className="text-[#7f9cf5]">.</span>
          </h1>
          <p className="text-base md:text-lg text-[#bfc9d9] mb-8 max-w-md">
            I'm ready to help you analyze data, generate code, or explore complex topics. What are we working on?
          </p>

          {/* Modern Search Bar (glassmorphism) */}
          <div className="mb-6 w-full">
            <div className="relative glass rounded-2xl bg-[#181f36]/50 border border-[#232946] shadow-md">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-[#7f9cf5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent text-white placeholder-[#bfc9d9] rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-[#7f9cf5]/60"
                placeholder="Ask anything..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onCreateChatFromSearch();
                  }
                }}
              />

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#7f9cf5] hover:bg-[#5a6fdc] text-[#151a2b] flex items-center justify-center transition"
                onClick={onCreateChatFromSearch}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 19v-6m0 0V5m0 8h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              Summarize an article
            </button>
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                <path d="M7 11l5-5 5 5" />
              </svg>
              Write a code snippet
            </button>
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              Analyze dataset
            </button>
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Debug an error
            </button>
          </div>
        </div>
      </main>

      <style>{`.glass{backdrop-filter:saturate(140%) blur(10px);}`}</style>
    </div>
  );
}

export default Home;

