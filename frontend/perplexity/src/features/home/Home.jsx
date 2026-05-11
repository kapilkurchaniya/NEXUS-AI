

import { useEffect } from 'react';
import { useChat } from '../chat/hooks/useChat';

const recentThreads = [
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
    ),
    title: 'Microservice Architecture...',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /></svg>
    ),
    title: 'Q3 Revenue Projections',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    ),
    title: 'Transformer Model Optimization',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4" /></svg>
    ),
    title: 'Database Schema Review',
  },
];

function Home() {
  const chat = useChat();
  useEffect(() => {
  chat.initializeSocketConnection()
  }, [chat]);

  return (
    <div className="min-h-screen flex bg-[#0a1020] text-white">
      {/* Sidebar */}
      <aside className="w-80 bg-[#151a2b] flex flex-col justify-between py-6 px-5 min-h-screen border-r border-[#232946]">
        <div>
          {/* Profile */}
          <div className="flex items-center gap-3 mb-8">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#232946]" />
            <div>
              <div className="font-semibold text-lg">Analytical Pilot</div>
              <div className="text-xs text-[#7f9cf5]">Pro Plan</div>
            </div>
          </div>
          {/* New Chat */}
          <button className="w-full bg-[#7f9cf5] hover:bg-[#5a6fdc] text-[#151a2b] font-semibold py-3 rounded-xl mb-8 transition text-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>New Chat
          </button>
          {/* Recent Threads */}
          <div>
            <div className="text-xs text-[#bfc9d9] font-semibold mb-2 tracking-widest">RECENT THREADS</div>
            <ul className="space-y-2">
              {recentThreads.map((thread, idx) => (
                <li key={idx} className="flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition">
                  {thread.icon}
                  <span className="truncate text-sm">{thread.title}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Workspace */}
          <div className="mt-8">
            <div className="text-xs text-[#bfc9d9] font-semibold mb-2 tracking-widest">WORKSPACE</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition">
                <svg className="w-5 h-5 text-[#bfc9d9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7h18" /></svg>
                <span className="truncate text-sm">Collections</span>
              </li>
              <li className="flex items-center gap-3 text-[#e5e9f7] hover:bg-[#232946] rounded-lg px-2 py-2 cursor-pointer transition">
                <svg className="w-5 h-5 text-[#bfc9d9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                <span className="truncate text-sm">Settings</span>
              </li>
            </ul>
          </div>
        </div>
        {/* System Status */}
        <div className="flex items-center gap-2 bg-[#181f36] rounded-xl px-4 py-2 mt-8">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
          <span className="text-sm text-[#bfc9d9]">System Status</span>
          <span className="ml-auto text-green-400 text-sm font-semibold">Online</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-xl text-left mb-8 mt-8 md:mt-20">
          <h1 className="text-5xl font-bold mb-2 text-[#e5e9f7]">Good evening<span className="text-[#7f9cf5]">.</span></h1>
          <p className="text-lg text-[#bfc9d9] mb-8 max-w-md">I'm ready to help you analyze data, generate code, or explore complex topics. What are we working on?</p>
          {/* Search Bar */}
          <div className="flex items-center bg-[#181f36] rounded-xl px-4 py-4 shadow-md mb-6 w-80">
            <svg className="w-6 h-6 text-[#7f9cf5] mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input className="flex-1 bg-transparent outline-none text-white placeholder-[#bfc9d9] text-lg" placeholder="Ask anything..." />
            <button className="ml-2 p-2 rounded hover:bg-[#232946]">
              <svg className="w-6 h-6 text-[#7f9cf5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19v-6m0 0V5m0 8h6m-6 0H6" /></svg>
            </button>
          </div>
          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
              Summarize an article
            </button>
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /><path d="M7 11l5-5 5 5" /></svg>
              Write a code snippet
            </button>
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              Analyze dataset
            </button>
            <button className="flex items-center gap-3 bg-[#181f36] hover:bg-[#232946] rounded-xl px-4 py-3 text-[#bfc9d9] text-base font-medium transition">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
              Debug an error
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;

