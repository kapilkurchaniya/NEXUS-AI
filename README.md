# 🔮 Nexus AI

A modern, full-stack AI chat application powered by **Google Gemini** and **Mistral AI**. Built with a premium glassmorphic dark UI, real-time AI conversations, image analysis, and a magical user experience.

---

## ✨ Features

### 🤖 AI Chat Engine
- **Google Gemini 2.5 Flash** for intelligent, context-aware conversations
- **Mistral AI** for automatic chat title generation
- Full conversation history with memory across messages
- Markdown rendering with syntax-highlighted code blocks

### 📷 Image Upload & AI Analysis
- Upload images directly in chat and ask AI questions about them
- **Drag & drop** images into the chat area
- **Paste screenshots** from clipboard (Ctrl+V)
- Multi-image support (up to 4 images per message)
- Image preview with remove before sending
- Click images to view in **fullscreen modal**
- Auto-compression & resize for optimal performance
- Supported formats: PNG, JPG, WEBP, GIF (max 5MB each)

### 💬 Premium Chat Experience
- Real-time AI "Thinking…" indicator with pulsing avatar
- **Copy AI responses** with one click
- Message timestamps on hover
- **Retry failed messages**
- Auto-scroll to latest message
- Staggered fade-in message animations
- Code blocks with syntax highlighting and copy button

### 🎨 Modern UI/UX
- **Glassmorphism** design with blur effects and glowing accents
- Dark theme with premium color palette
- Responsive design (mobile, tablet, desktop)
- Animated sidebar with chat history
- Profile dropdown with avatar and sign-out
- Toast notification system
- Floating composer with focus glow effect
- Smooth page transitions and micro-animations

### 🔐 Authentication & Security
- JWT-based authentication with httpOnly cookies
- User registration & login
- Forgot/reset password via email
- Protected routes with back-button prevention
- Secure logout (cookie clear + Redux reset + socket disconnect)

### 📱 Chat Management
- Persistent chat history
- AI-generated chat titles
- Delete conversations
- Switch between conversations seamlessly

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **Redux Toolkit** | State management |
| **React Router 7** | Client-side routing |
| **Socket.IO Client** | Real-time communication |
| **Tailwind CSS 4** | Utility classes |
| **Vanilla CSS** | Custom glassmorphic design system |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | API server |
| **MongoDB + Mongoose 9** | Database |
| **LangChain** | AI orchestration |
| **Google Gemini 2.5 Flash** | AI responses + image analysis |
| **Mistral AI** | Chat title generation |
| **Socket.IO** | Real-time events |
| **JWT + bcrypt** | Authentication |
| **Nodemailer** | Email service |

---

## 📁 Project Structure

```
perplexity/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   └── chat.controller.js
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── chat.model.js
│   │   │   └── message.model.js
│   │   ├── routes/            # Express routes
│   │   │   ├── auth.routes.js
│   │   │   └── chat.route.js
│   │   ├── services/          # Business logic
│   │   │   ├── ai.service.js
│   │   │   └── mail.service.js
│   │   ├── middlewares/       # Auth middleware
│   │   ├── sockets/           # Socket.IO setup
│   │   └── app.js             # Express app config
│   ├── server.js              # Entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/perplexity/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx        # Root component
│   │   │   ├── app.routes.jsx # Route definitions
│   │   │   ├── store.js       # Redux store
│   │   │   └── index.css      # Design system & styles
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── pages/     # Login, Register, Forgot/Reset Password
│   │   │   │   ├── components/# Protected, Toast
│   │   │   │   ├── hook/      # useAuth
│   │   │   │   ├── services/  # auth.api.js
│   │   │   │   └── auth.slice.js
│   │   │   ├── chat/
│   │   │   │   ├── pages/     # Chat.jsx (main chat UI)
│   │   │   │   ├── components/# Sidebar, Layout
│   │   │   │   ├── hooks/     # useChat, useImageUpload
│   │   │   │   ├── sevices/   # chat.api.js, chat.socket.js
│   │   │   │   └── chat.slice.js
│   │   │   └── home/          # Home.jsx (landing)
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB** (Atlas or local)
- **Google AI API Key** (Gemini)
- **Mistral AI API Key**

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key
GOOGLE_API_KEY=your-google-gemini-api-key
MISTRAL_API_KEY=your-mistral-api-key
GOOGLE_USER_EMAIL=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-app-password
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend/perplexity
npm install
npm run dev
```

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

---

## 🎯 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/get-me` | Get current user |
| `POST` | `/api/auth/logout` | Logout (clear cookie) |
| `POST` | `/api/auth/forgot-password` | Send reset email |
| `POST` | `/api/auth/reset-password/:token` | Reset password |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/message` | Send message (text + images) |
| `GET` | `/api/chat/` | Get all user chats |
| `GET` | `/api/chat/:chatId/messages` | Get messages for a chat |
| `DELETE` | `/api/chat/delete/:chatId` | Delete a chat |

---

## 🖼️ Image Upload

Images are sent as **base64** in the request body:

```json
{
  "chatId": "optional-existing-chat-id",
  "message": "What's in this image?",
  "images": [
    {
      "data": "base64-encoded-string",
      "mimeType": "image/jpeg",
      "name": "photo.jpg"
    }
  ]
}
```

The backend passes images to **Gemini** as multimodal content for vision analysis.

---

## 🎨 Design System

The app uses a custom CSS design system with CSS custom properties:

| Token | Purpose |
|-------|---------|
| `--bg-primary` | Main background |
| `--bg-surface` | Card/surface background |
| `--accent` | Primary accent (indigo) |
| `--accent-gradient` | Gradient for buttons/avatars |
| `--shadow-glow` | Glow effect for interactive elements |
| `--border` | Subtle border color |
| `--radius-md` | Standard border radius |

---

## 🛣️ Roadmap

- [ ] Streaming AI responses (word-by-word)
- [ ] Stop generation button
- [ ] Voice input (speech-to-text)
- [ ] Text-to-speech for AI responses
- [ ] Cloudinary/S3 image storage
- [ ] Search conversations
- [ ] Chat folders & pinning
- [ ] Export chats as PDF/Markdown
- [ ] Dark/light mode toggle
- [ ] Conversation sharing

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <strong>Kapil Kurchaniya</strong>
</p>
