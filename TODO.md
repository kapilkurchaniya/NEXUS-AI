# TODO - UI/UX Redesign (Home + Chat)

- [ ] Inspect current implementations (done)
- [ ] Update `frontend/perplexity/src/features/chat/hooks/useChat.js` to add send-guard/in-flight protection and expose optional chat-loading helper.
- [ ] Update `frontend/perplexity/src/features/home/Home.jsx`:
  - [ ] Replace hardcoded thread list with dynamic `state.chat.chats` list from backend
  - [ ] Add AI-title, last-message preview, and active chat highlighting
  - [ ] Implement responsive sidebar (desktop fixed / tablet collapsible / mobile drawer)
  - [ ] Redesign search bar with glassmorphism, rounded input, and send button inside input
- [ ] Update `frontend/perplexity/src/features/chat/pages/Chat.jsx`:
  - [ ] Redesign UI layout (modern, responsive)
  - [ ] User messages right / AI messages left
  - [ ] Add markdown/code styling renderer
  - [ ] Add typing/loading indicator
  - [ ] Add smooth scrolling to bottom
  - [ ] Add sticky top header
  - [ ] Prevent multiple sends by disabling during in-flight send
  - [ ] When first message is sent from empty route (`chatId` missing), navigate to `/chat/:chatId` immediately using returned value
- [ ] Update `frontend/perplexity/src/features/chat/chat.slice.js` only if needed.
- [ ] Run frontend lint/build and verify manually (dev server).

