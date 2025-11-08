import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import "./ChatPage.css";

const ChatPage = () => {
  const { chatId } = useParams(); // CHATID FROM HEADER
  const [loading, setLoading] = useState(true); // CHECKS WHETHER DATA IS GETTING FETCHED OR NOT
  const [messages, setMessages] = useState([]); // HOLDS ALL THE CONVERSATIONS
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 770); // Default open only for wide screens

  // ✅ Sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // ✅ Auto close/open sidebar on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 770 && isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (window.innerWidth > 770 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  // ✅ Fetch messages whenever chatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setMessages([]);
        const response = await axios.get(
          `https://chatgpt-iet7.onrender.com/api/chat/${chatId}/messages`,
          { withCredentials: true }
        );
        setMessages(response.data.messages);
        console.log(response.data.messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) fetchMessages();
  }, [chatId]);

  return (
    <div className="chat-page">
      {/* ✅ Menu button fixed outside sidebar (always visible on mobile) */}
      <button className="menu-button" onClick={toggleSidebar}>
        ☰
      </button>

      {/* ✅ Sidebar stays same */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
      />

      {loading ? (
        <div className="loading">Loading Chat...</div>
      ) : (
        <div className={`chat-area-container ${isSidebarOpen ? "shifted" : ""}`}>
          <div className="main-container">
            <ChatArea
              toggleSidebar={toggleSidebar}
              messages={messages}
              chatId={chatId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;




