// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "./ChatArea.css";
// import Searchbar from "./Searchbar";
// import axios from "axios";
// import socket from "../socket";

// const ChatArea = () => {
//   const { chatId } = useParams();
//   const navigate = useNavigate();

//   const [isActive, setIsActive] = useState(false);
//   const [welcomeText, setWelcomeText] = useState("");
//   const [aiText, setAiText] = useState("");
//   const [displayText, setDisplayText] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [messageProcessed, setMessageProcessed] = useState(false);

//   // ✅ Reset messages & state when chatId changes (mount/unmount)
//   useEffect(() => {
//     setMessages([]);
//     setAiText("");
//     setDisplayText("");
//     setIsTyping(false);
//     setIsLoading(false);
//     setMessageProcessed(false);
//   }, [chatId]);

//   // ✅ Listen for AI responses
//   useEffect(() => {
//     const handleAIResponse = (data) => {
//       console.log("📨 Received AI response:", data);
//       if (messageProcessed) return;
//       setMessageProcessed(true);
//       setAiText(data.content);
//       setDisplayText("");
//       setIsTyping(true);
//       setIsLoading(false);
//     };

//     socket.off("ai-response");
//     socket.on("ai-response", handleAIResponse);

//     return () => {
//       socket.off("ai-response", handleAIResponse);
//     };
//   }, [messageProcessed]);

//   // ✅ Fetch messages whenever chatId changes
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         if (!chatId) return;
//         const res = await axios.get(
//           `https://chatgpt-iet7.onrender.com/api/chat/${chatId}/messages`,
//           { withCredentials: true }
//         );
//         setMessages(res.data.messages || []);
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           navigate("/login");
//         }
//       }
//     };

//     fetchMessages();
//   }, [chatId, navigate]);

//   // ✅ AI typing animation
//   useEffect(() => {
//     if (isTyping && aiText) {
//       let i = -1;
//       const speed = 40;
//       const interval = setInterval(() => {
//         if (i < aiText.length) {
//           setDisplayText((prev) => prev + aiText.charAt(i));
//           i++;
//         } else {
//           clearInterval(interval);
//           setIsTyping(false);
//           setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
//           setMessageProcessed(false);
//         }
//       }, speed);
//       return () => clearInterval(interval);
//     }
//   }, [aiText, isTyping]);

//   // ✅ Welcome text animation
//   useEffect(() => {
//     const text = "Start a new conversation or continue where you left off.";
//     let i = 0;
//     const interval = setInterval(() => {
//       setWelcomeText(text.substring(0, i + 1));
//       i++;
//       if (i === text.length) clearInterval(interval);
//     }, 50);
//     return () => clearInterval(interval);
//   }, []);

//   // ✅ Handle user message
//   const handleUserMessage = async (msg) => {
//     if (isLoading || isTyping) return;

//     setIsLoading(true);
//     setMessageProcessed(false);
//     setMessages((prev) => [...prev, { role: "user", text: msg }]);

//     // ✅ Emit socket message (no axios)
//     socket.emit("ai-message", { chat: chatId, message: msg });
//   };

//   return (
//     <main className={`chat-area ${isActive ? "active" : ""}`}>
//       {/* 🟩 When no chat is selected */}
//       {!chatId ? (
//         <div className="empty-chat">
//           <div className="welcome">
//             <h1>ChatGPT Clone</h1>
//             <p>Please select or create a chat to begin.</p>
//           </div>
//         </div>
//       ) : messages.length === 0 ? (
//         // 🟩 Empty chat (with welcome + search)
//         <div className="empty-chat">
//           <div className="welcome">
//             <h1>ChatGPT Clone</h1>
//             <p>{welcomeText}</p>
//           </div>

//           {/* ✅ Show searchbar only if chatId exists */}
//           <div className="center-search">
//             <Searchbar
//               onSearchStart={handleUserMessage}
//               socket={socket}
//               isDisabled={isTyping || isLoading}
//               className="search-bar"
//             />
//           </div>
//         </div>
//       ) : (
//         // 🟩 Normal chat mode
//         <>
//           <div className="chat-messages">
//             {messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`message ${msg.role === "user" ? "user" : "ai"}`}
//               >
//                 <p>{msg.text || msg.content}</p>
//               </div>
//             ))}

//             {isTyping && (
//               <div className="message ai">
//                 <p>
//                   {displayText}
//                   <span className="cursor">|</span>
//                 </p>
//               </div>
//             )}

//             {isLoading && (
//               <div className="loading-text">
//                 <p>Loading...</p>
//               </div>
//             )}
//           </div>

//           {/* ✅ Render only if chatId exists */}
//           {chatId && (
//             <Searchbar
//               onSearchStart={handleUserMessage}
//               socket={socket}
//               isDisabled={isTyping || isLoading}
//               className="search-bar"
//             />
//           )}
//         </>
//       )}
//     </main>
//   );
// };

// export default ChatArea;

import React, { useState, useEffect, useRef } from "react";

const ChatArea = ({ messages=[], sendMessage, chatId }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [tmpTypedText, setTmpTypedText] = useState("");
  const bottomRef = useRef();

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing animation for last AI message
  useEffect(() => {
    if (!messages.length) return;

    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === "ai") {
      setIsTyping(true);
      typeText(lastMsg.text);
    }
  }, [messages]);

  const typeText = async (text) => {
    setTmpTypedText("");
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setTmpTypedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="chat-area">
      <div className="messages-list">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msgBubble ${msg.role === "user" ? "mine" : "ai"}`}
          >
            {msg.role === "ai" && i === messages.length - 1 && isTyping
              ? tmpTypedText
              : msg.text}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="inputSection">
        <input
          type="text"
          value={input}
          placeholder="Type here..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="sendIcon"
          disabled={!input.trim() || !chatId}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
