import React, { useState, useEffect, useRef } from "react";
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
  const [socketReady, setSocketReady] = useState(false);
  
  const bottomRef = useRef(null);
  const aiResponseHandlerRef = useRef(null);

  // ✅ Socket connection management
  useEffect(() => {
    const connectHandler = () => {
      console.log("🔗 Socket connected:", socket.id);
      setSocketReady(true);
    };

    const disconnectHandler = () => {
      console.log("❌ Socket disconnected");
      setSocketReady(false);
    };

    const connectErrorHandler = (error) => {
      console.error("❌ Socket connection error:", error);
      setSocketReady(false);
    };

    // Check if already connected
    if (socket.connected) {
      console.log("✅ Socket already connected:", socket.id);
      setSocketReady(true);
    }

    socket.on("connect", connectHandler);
    socket.on("disconnect", disconnectHandler);
    socket.on("connect_error", connectErrorHandler);

    return () => {
      socket.off("connect", connectHandler);
      socket.off("disconnect", disconnectHandler);
      socket.off("connect_error", connectErrorHandler);
    };
  }, []);

  // ✅ AI Response Handler - Set up ONCE and keep stable
  useEffect(() => {
    const handleAIResponse = (data) => {
      console.log("🤖 AI Response received:", data);
      
      setAiText(data.content);
      setDisplayText("");
      setIsTyping(true);
      setIsLoading(false);
    };

    // Store reference for cleanup
    aiResponseHandlerRef.current = handleAIResponse;

    // Remove existing listener before adding new one
    socket.off("ai-response");
    socket.on("ai-response", handleAIResponse);

    console.log("✅ AI response listener registered");

    return () => {
      console.log("🧹 Cleaning up AI response listener");
      socket.off("ai-response", handleAIResponse);
    };
  }, []); // Empty deps - set up once

  // ✅ Add error handler for socket
  useEffect(() => {
    const errorHandler = (error) => {
      console.error("❌ Socket error:", error);
      setIsLoading(false);
    };

    socket.on("error", errorHandler);

    return () => {
      socket.off("error", errorHandler);
    };
  }, []);

  // ✅ Reset state when chatId changes
  useEffect(() => {
    console.log("🔄 Chat ID changed:", chatId);
    setAiText("");
    setDisplayText("");
    setIsTyping(false);
    setIsLoading(false);
  }, [chatId]);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isLoading]);

  // ✅ Fetch messages when chatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) return;
        
        console.log("📥 Fetching messages for chat:", chatId);
        const res = await axios.get(
          `https://chatgpt-iet7.onrender.com/api/chat/${chatId}/messages`,
          { withCredentials: true }
        );
        console.log("✅ Messages fetched:", res.data.messages?.length || 0);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
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
      let i = 0;
      const speed = 40;
      const interval = setInterval(() => {
        if (i < aiText.length) {
          setDisplayText((prev) => prev + aiText.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
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
    if (!socket.connected) {
      console.error("❌ Socket not connected!");
      alert("Connection error. Please refresh the page.");
      return;
    }

    if (isLoading || isTyping) {
      console.log("⏳ Already processing a message");
      return;
    }

    console.log("📤 Sending message:", msg);
    console.log("🔌 Socket ID:", socket.id);
    console.log("💬 Chat ID:", chatId);

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: msg }]);

    // Emit socket message
    socket.emit("ai-message", { chat: chatId, message: msg });
    console.log("✅ Message emitted to server");
  };

  return (
    <main className={`chat-area ${isActive ? "active" : ""}`}>
      {/* 🟩 When no chat is selected */}
      {!chatId ? (
        <div className="empty-chat">
          <div className="welcome">
            <h1>Sahaayak AI</h1>
            <p>Please select or create a chat to begin.</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        // 🟩 Empty chat (with welcome + search)
        <div className="empty-chat">
          <div className="welcome">
            <h1>Sahaayak AI</h1>
            <p>{welcomeText}</p>
          </div>

          <div className="center-search">
            <Searchbar
              onSearchStart={handleUserMessage}
              socket={socket}
              isDisabled={isTyping || isLoading || !socketReady}
              className="search-bar"
            />
          </div>
        </div>
      ) : (
        // 🟩 Normal chat mode
        <>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === "user" ? "user" : "ai"}`}
              >
                <p>{msg.text || msg.content}</p>
                <MessageActions text={msg.text || msg.content} />
              </div>
            ))}

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
            
            <div ref={bottomRef}></div>
          </div>

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