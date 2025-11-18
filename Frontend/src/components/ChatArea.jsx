import React, { useState, useEffect,useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ChatArea.css";
import Searchbar from "./Searchbar";
import axios from "axios";
import socket from "../socket";
import MessageActions from "./MessageActions";

const ChatArea = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [welcomeText, setWelcomeText] = useState("");
  const [aiText, setAiText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageProcessed, setMessageProcessed] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

useEffect(() => {
  const connectHandler = () => {
    console.log("🔗 Socket connected:", socket.id);
    setSocketReady(true);
  };

  const disconnectHandler = () => {
    console.log("❌ Socket disconnected");
    setSocketReady(false);
  };

  // ✅ Check if socket is already connected on mount/chatId change
  if (socket.connected) {
    console.log("✅ Socket already connected:", socket.id);
    setSocketReady(true);
  }

  socket.on("connect", connectHandler);
  socket.on("disconnect", disconnectHandler);

  return () => {
    socket.off("connect", connectHandler);
    socket.off("disconnect", disconnectHandler);
  };
}, [chatId]);


  // ✅ Reset messages & state when chatId changes (mount/unmount)
useEffect(() => {
    // setMessages([]);
    setAiText("");
    setDisplayText("");
    setIsTyping(false);
    setIsLoading(false);
    setMessageProcessed(false);
}, [chatId]);
//Used to navigate to the bottom of the chat
const bottomRef = useRef(null);

  
useEffect(() => {
  const handleAIResponse = (data) => {
    setMessageProcessed(true);
    setAiText(data.content);
    setDisplayText("");
    setIsTyping(true);
    setIsLoading(false);
  };

  // Remove existing listener before adding
  socket.off("ai-response");
  socket.on("ai-response", handleAIResponse);

  return () => {
    socket.off("ai-response", handleAIResponse);
  };
}, []);
  

//navigate to the bottom of the chat

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isTyping, isLoading]);

 // ✅ Fetch messages whenever chatId changes
useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) return;
        const res = await axios.get(
          `https://chatgpt-iet7.onrender.com/api/chat/${chatId}/messages`,
          { withCredentials: true }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        }
      }
    };

    fetchMessages();
}, [chatId, navigate]);

// ✅ AI typing animation
useEffect(() => {
    if (isTyping && aiText) {
      let i = -1;
      const speed = 40;
      const interval = setInterval(() => {
        if (i < aiText.length) {
          setDisplayText((prev) => prev + aiText.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
          setMessageProcessed(false);
        }
      }, speed);
      return () => clearInterval(interval);
    }
}, [aiText, isTyping]);

// ✅ Welcome text animation
useEffect(() => {
    const text = "Start a new conversation or continue where you left off.";
    let i = 0;
    const interval = setInterval(() => {
      setWelcomeText(text.substring(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
}, []);

// ✅ Handle user message
const handleUserMessage = async (msg) => {
    if(!socket.connected){
      console.log("Socket not connected yet")
    }
    if (isLoading || isTyping) return;

    setIsLoading(true);
    setMessageProcessed(false);
    setMessages((prev) => [...prev, { role: "user", text: msg }]);

    // ✅ Emit socket message (no axios)
    socket.emit("ai-message", { chat: chatId, message: msg });
};

  return (
    <main className={`chat-area ${isActive ? "active" : ""}`}>
      {/* 🟩 When no chat is selected */}
      {!chatId ? (
        <div className="empty-chat">
          <div className="welcome">
            <h1>ChatGPT Clone</h1>
            <p>Please select or create a chat to begin.</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        // 🟩 Empty chat (with welcome + search)
        <div className="empty-chat">
          <div className="welcome">
            <h1>ChatGPT Clone</h1>
            <p>{welcomeText}</p>
          </div>

          {/* ✅ Show searchbar only if chatId exists */}
          <div className="center-search">
            <Searchbar
              onSearchStart={handleUserMessage}
              socket={socket}
              isDisabled={isTyping || isLoading}
              className="search-bar"
            />
          </div>
        </div>
      ) : (
        // 🟩 Normal chat mode
        <>
          <div className="chat-messages">
            {/* {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === "user" ? "user" : "ai"}`}
              >
                <p>{msg.text || msg.content}</p>
              </div>
            ))} */}

            {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role === "user" ? "user" : "ai"}`}>
              <p>{msg.text || msg.content}</p>
              <MessageActions text={msg.text || msg.content} />
            </div>
            ))}

            {/* {isTyping && (
              <div className="message ai">
                <p>
                  {displayText}
                  <span className="cursor">|</span>
                </p>
              </div>
            )} */}

            {isTyping && (
              <div className="message ai">
                <p>
                  {displayText}
                  <span className="cursor">|</span>
                </p>
                <MessageActions text={displayText} />
              </div>
            )}


            {isLoading && (
              <div className="loading-text">
                <p>Loading...</p>
              </div>
            )}
            {/* ✅ This div marks the bottom */}
            <div ref={bottomRef}></div>
          </div>

          {/* ✅ Render only if chatId exists */}
          {chatId && (
            <Searchbar
              onSearchStart={handleUserMessage}
              socket={socket}
              isDisabled={isTyping || isLoading || !socketReady}
              className="search-bar"
            />
          )}
        </>
      )}
    </main>
  );
};

export default ChatArea;


