import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaPlus, FaCog, FaBars } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { chatId } = useParams();

  // ✅ Function to fetch chats (reusable)
  const fetchChats = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await axios.get("https://chatgpt-iet7.onrender.com/api/chat", {
        withCredentials: true,
      });

      if (response.data.chats) {
        setChats(response.data.chats.map((c) => ({ id: c._id, title: c.title })));
      }
    } catch (err) {
      console.error("ERROR FETCHING CHATS:", err);
    }
  };

  // ✅ Fetch chats when component mounts
  useEffect(() => {
    fetchChats();
  }, []);

  // ✅ CREATE NEW CHAT
  const handleNewChat = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        alert("Please log in first!");
        navigate('/login');
        return;
      }

      const newChatTitle = window.prompt("Enter a title for your new chat:");
      if (!newChatTitle || newChatTitle.trim() === "") return;

      const response = await axios.post(
        "https://chatgpt-iet7.onrender.com/api/chat",
        { title: newChatTitle },
        { withCredentials: true }
      );

      if (response.status === 201 || response.status === 200) {
        const { _id } = response.data.chat;

        // ✅ Re-fetch chats from backend
        await fetchChats();

        // ✅ Navigate to the new chat route
        
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create chat");
    }
  };

  // HANDLE CHAT CLICK
  const handleChatClick = (id) => {
    navigate(`/chat/${id}`);
  };

  return (
    <>
    {!isOpen && (
    <button className="menu-button" onClick={toggleSidebar}>
    ☰
    </button>
    )}

    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      
      <div className="sidebar-header">
        <h2>ChatGPT Clone</h2>
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <div className="sidebar-content">
        <button className="new-chat" onClick={handleNewChat}>
          <FaPlus /> New Chat
        </button>

        <div className="chat-history">
          {chats.length === 0 ? (
            <p className="no-chat">No chats yet</p>
          ) : (
            <ul className="chat-list">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className={`chat-item ${chatId === chat.id ? "active" : ""}`}
                  onClick={() => handleChatClick(chat.id)}
                  title={chat.title} // tooltip for long titles
                >
                  {chat.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="settings" onClick={()=>{navigate(`/settings`)}}>
          <FaCog /> Settings
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
