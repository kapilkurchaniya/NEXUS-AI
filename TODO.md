# TODO - Persistent Chat History System

- [ ] Step 1: Redesign `Home.jsx`
  - [ ] Load chats on mount with loading skeletons
  - [ ] Empty state when no chats
  - [ ] Modern responsive chat-history layout (latest first)
  - [ ] Chat cards show: AI title, last message preview, timestamp, active state
  - [ ] Improve search/input UI (glassmorphism)
  - [ ] Clicking chat sets currentChatId + navigates to `/chat/:chatId`

- [ ] Step 2: Redesign `Chat.jsx`

  - [ ] Modern ChatGPT-like layout (typography/spacing/responsive)
  - [ ] Stable message rendering to avoid flicker
  - [ ] Correct optimistic sending (single click creates single user+ai pair)
  - [ ] Remove/fix duplicate message updates + avoid unnecessary refetches
  - [ ] Auto-scroll to latest message reliably
  - [ ] Keep socket init stable; do not add repeated listeners

- [ ] Step 3 (only if needed): Adjust `useChat.js`
  - [ ] Ensure send-guard/in-flight protection matches Chat.jsx behavior
  - [ ] Prevent any duplicate chat/message creation

- [ ] Step 4: Verification
  - [ ] Create chat from empty route and ensure navigation to `/chat/:chatId`
  - [ ] Refresh chat page restores full history
  - [ ] Back/forward button works
  - [ ] Confirm sidebar shows AI titles immediately
  - [ ] Confirm no duplicate messages
  - [ ] Run frontend lint/build and basic manual testing

