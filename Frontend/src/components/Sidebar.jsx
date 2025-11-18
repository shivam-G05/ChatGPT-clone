import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaPlus, FaCog, FaBars, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { chatId } = useParams();

  // ✅ Function to fetch chats 
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
        await fetchChats();
        navigate(`/chat/${_id}`);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create chat");
    }
  };

  // ✅ DELETE CHAT
  const handleDeleteChat = async (e, chatIdToDelete) => {
    e.stopPropagation(); // Prevent triggering chat click

    const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmDelete) return;

    try {
      const token = Cookies.get("token");
      if (!token) {
        alert("Please log in first!");
        navigate('/login');
        return;
      }

      const response = await axios.delete(
        `https://chatgpt-iet7.onrender.com/api/chat/${chatIdToDelete}`,
        { withCredentials: true }
      );

      if (response.status === 204) {
        await fetchChats();

        // If deleted chat is currently active, navigate away
        if (chatId === chatIdToDelete) {
          const remainingChats = chats.filter(c => c.id !== chatIdToDelete);
          if (remainingChats.length > 0) {
            navigate(`/chat/${remainingChats[0].id}`);
          } else {
            navigate('/');
          }
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat");
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
                    title={chat.title}
                  >
                    <span className="chat-title">{chat.title}</span>
                    <button
                      className="delete-chat-btn"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      title="Delete chat"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="settings" onClick={() => { navigate(`/settings`) }}>
            <FaCog /> Settings
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
