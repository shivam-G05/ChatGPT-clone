import React, { useState, useRef, useEffect } from "react";
import "./Searchbar.css"; 
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Searchbar = ({ socket, onSearchStart, isDisabled }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { chatId } = useParams();
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Force reset height first
      textarea.style.height = "40px";
      
      // If query is empty, keep it at min height
      if (!query.trim()) {
        return;
      }
      
      // Calculate new height based on content
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = window.innerHeight * 0.4; // 40vh in pixels
      
      if (scrollHeight > 40) {
        textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";
      }
    }
  }, [query]);

  const handleSearchClick = async () => {
    if (!query.trim()) {
      alert("Please enter a search query");
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "https://chatgpt-iet7.onrender.com/api/auth/verify",
        {
          withCredentials: true,
        }
      );

      if (response.data.valid === "true") {
        console.log("User verified, connecting socket...");

        // Pass user message to ChatArea to display it in chat
        onSearchStart(query.trim());

        // Send the message to backend via socket
        // socket.emit("ai-message", { chat: chatId, message: query.trim() });

        // Clear the query
        setQuery("");
        
        // Force height reset immediately
        if (textareaRef.current) {
          textareaRef.current.style.height = "40px";
        }
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.log("Error verifying user:", err);
      navigate("/login");
    }
  };

  // Handle Enter key (Shift+Enter for new line, Enter to submit)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearchClick();
    }
  };

  return (
    <div className={`expandable-search-wrapper${isDisabled ? " disable" : ""}`}>
      <textarea
        ref={textareaRef}
        placeholder="What's on your mind?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="expandable-search-input"
        disabled={isDisabled}
        rows={1}
      />
      <span
        className={`material-symbols-outlined expandable-search-icon${
          isDisabled ? " disabled" : ""
        }`}
        onClick={!isDisabled ? handleSearchClick : undefined}
      >
        search
      </span>
    </div>
  );
};

export default Searchbar;
