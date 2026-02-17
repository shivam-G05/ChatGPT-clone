# 💬 ChatGPT Clone — AI Chat App with Long-Term Memory

A full-stack AI-powered chat web application that delivers a real-time conversational experience — just like ChatGPT. Built with WebSockets for instant messaging and a vector database for context-aware, personalized responses.

> ⚡ Built from scratch to deeply understand how real AI chat systems work!

<img width="1844" height="848" alt="Chat Interface" src="https://github.com/user-attachments/assets/0893cb2b-2797-4a23-b4ef-a462f1cc5622" />

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#️-how-it-works)
- [Screenshots](#️-screenshots--demo)
- [Setup Instructions](#️-setup-instructions)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Future Enhancements](#-future-enhancements)
- [Author](#️-author)

---

## 📌 Overview

ChatGPT Clone is a production-inspired AI chat application that goes beyond basic request-response patterns. It features:

- **Real-time bidirectional messaging** using Socket.io
- **Persistent long-term memory** powered by a vector database — the AI remembers your past conversations
- **Secure authentication** with JWT tokens and HTTP-only cookies
- **Full chat history** retrieval across sessions

Whether you're exploring how AI chat apps work under the hood or building on top of this as a foundation, this project covers the complete stack from auth to AI integration.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 💭 **Real-time Chat** | Smooth, bi-directional communication powered by Socket.io WebSockets |
| 🧠 **Long-Term Memory** | Vector database stores embeddings of past interactions for context-aware replies |
| 👤 **Authentication** | JWT-based login & registration with HTTP-only cookies for secure session management |
| 📨 **Password Reset** | Secure email-based password reset flow using NodeMailer |
| 💬 **Chat History** | All past conversations fetched and displayed dynamically on login |
| 🎨 **Responsive UI** | Clean, modern interface built with React and Tailwind CSS |
| 🌐 **Cloud Deployed** | Backend hosted on Render, database on MongoDB Atlas |

---

## 🧠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js** | UI Framework |
| **Tailwind CSS** | Styling & responsive design |
| **Socket.io Client** | Real-time WebSocket communication |
| **Axios** | HTTP requests to backend API |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js / Express.js** | REST API server |
| **Socket.io** | WebSocket server for real-time messaging |
| **MongoDB Atlas** | Cloud NoSQL database for users & chat history |
| **JWT + HTTP-only Cookies** | Secure user authentication & session management |
| **NodeMailer** | Transactional emails for password reset |

### AI & Memory
| Technology | Purpose |
|---|---|
| **OpenAI API** | AI response generation |
| **Pinecone / FAISS** | Vector database for long-term memory storage |
| **Text Embeddings** | Converts messages into vectors for semantic search |

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     MESSAGE FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User sends a message via the chat UI                     │
│         ↓                                                    │
│  2. Message transmitted instantly via Socket.io              │
│         ↓                                                    │
│  3. Backend fetches relevant past context from vector DB     │
│         ↓                                                    │
│  4. AI API called with message + retrieved context           │
│         ↓                                                    │
│  5. AI response streamed back to client via WebSocket        │
│         ↓                                                    │
│  6. Query–response pair embedded & stored in vector DB       │
│         ↓                                                    │
│  7. Conversation saved to MongoDB for chat history           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   MEMORY RETRIEVAL                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  New message → Generate embedding                            │
│         ↓                                                    │
│  Semantic search in vector DB for similar past messages      │
│         ↓                                                    │
│  Top-k relevant past exchanges retrieved                     │
│         ↓                                                    │
│  Injected into AI prompt as context                          │
│         ↓                                                    │
│  AI responds with full conversation awareness                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Screenshots / Demo

<img width="1844" height="848" alt="Chat Interface" src="https://github.com/user-attachments/assets/0893cb2b-2797-4a23-b4ef-a462f1cc5622" />
<img width="1814" height="835" alt="Chat History" src="https://github.com/user-attachments/assets/d0acf557-dfec-42aa-9c27-c370501adb4b" />
<img width="1862" height="851" alt="Login Screen" src="https://github.com/user-attachments/assets/fde47e0c-221c-434d-a13f-a4488f9f6aa5" />
<img width="1901" height="846" alt="Dashboard" src="https://github.com/user-attachments/assets/5d004e5e-2f5f-4791-bf91-50efede2ca21" />

---

## 🛠️ Setup Instructions

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)
- A **MongoDB Atlas** account — [Sign up](https://www.mongodb.com/atlas)
- An **OpenAI** API key — [Get one](https://platform.openai.com/)
- A **Pinecone** account for vector storage — [Sign up](https://www.pinecone.io/)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/chatgpt-clone.git
cd chatgpt-clone
```

### Step 2: Install Frontend Dependencies

```bash
cd client
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd ../server
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file inside the `server/` folder (see [Environment Variables](#-environment-variables) for details):

```bash
touch server/.env
```

### Step 5: Run the Application

**Start the backend:**
```bash
cd server
npm start
```
Backend runs on: `http://localhost:5000`

**Start the frontend (new terminal):**
```bash
cd client
npm start
```
Frontend runs on: `http://localhost:3000`

---

## 📁 Project Structure

```
chatgpt-clone/
│
├── client/                        # React frontend
│   ├── public/
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Route-level pages (Login, Chat, etc.)
│       ├── context/               # Auth & Chat context providers
│       ├── hooks/                 # Custom React hooks
│       ├── utils/                 # API helpers & socket config
│       └── App.jsx                # Main app with routing
│
├── server/                        # Node.js backend
│   ├── controllers/               # Route handler logic
│   ├── middleware/                 # Auth middleware (JWT verification)
│   ├── models/                    # Mongoose schemas (User, Message)
│   ├── routes/                    # Express API routes
│   ├── utils/                     # Email, embedding & vector DB helpers
│   ├── socket.js                  # Socket.io configuration
│   ├── .env                       # Environment variables (not committed)
│   └── index.js                   # Server entry point
│
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory with the following:

```env
# Database
MONGO_URI=your_mongodb_atlas_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Email (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI
AI_API_KEY=your_openai_api_key

# Vector Database
VECTOR_DB_API_KEY=your_pinecone_api_key
```

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `EMAIL_USER` | Gmail address used for sending reset emails |
| `EMAIL_PASS` | Gmail App Password *(not your regular password)* |
| `AI_API_KEY` | OpenAI API key for chat completions |
| `VECTOR_DB_API_KEY` | Pinecone (or equivalent) API key |

> 💡 **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords to generate one.

---

## 🔒 Security Notes

- All passwords are hashed before being stored in the database
- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- Environment variables are never exposed to the frontend
- Email reset tokens are time-limited and single-use
- **Never commit your `.env` file** — ensure it's listed in `.gitignore`

---

## 🌟 Future Enhancements

- 🧑‍🏫 **AI Personas** — Switch between modes like Teacher, Developer, or Friend
- 🎙️ **Voice I/O** — Add speech-to-text input and text-to-speech responses
- 📲 **Mobile App** — React Native version for iOS and Android
- 🧩 **Multi-model Support** — Plug in different AI models (Claude, Gemini, etc.)
- 📁 **File Uploads** — Let users share images or documents in chat
- 🌍 **Multilingual Support** — Auto-detect and respond in the user's language

---

## 👨‍💻 Author

**Shivam Goel**
B.Tech 2nd Year | Full Stack Developer (AI & ML Integrations)

- 📧 Email: [shivamkgjj2005@gmail.com](mailto:shivamkgjj2005@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/shivam-goel-6236432a8](https://www.linkedin.com/in/shivam-goel-6236432a8/)
- 🐙 GitHub: [github.com/shivam-G05](https://github.com/shivam-G05)

---

> ⭐ If you found this project helpful or interesting, please give it a star on GitHub — it helps a lot!
