import React from "react";
import "./ChatArea.css";
import Cookies from "js-cookie";
import { useNavigate ,useParams} from "react-router-dom";
import axios from "axios";
import { useState } from "react";



const Searchbar = ({ socket, onSearchStart, isDisabled }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const {chatId} = useParams();

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
    const response = await axios.get("https://chatgpt-iet7.onrender.com/api/auth/verify", {
      withCredentials: true,
    });

    if (response.data.valid === "true") {
      console.log("User verified, connecting socket...");

-     // ✅ Pass user message to ChatArea to display it in chat
-     onSearchStart(query.trim());

      // ✅ Send the message to backend via socket
      // socket.emit("ai-message", { chat: chatId, message: query.trim() });

      setQuery("");
    } else {
      navigate("/login");
    }
  } catch (err) {
    console.log("Error verifying user:", err);
    navigate("/login");
  }
};

  return (
    <>
      <div className={`search-bar${isDisabled ? " disable" : ""}`}>
        <input
          type="text"
          placeholder="What's on your mind?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          disabled={isDisabled}
        />
        <span
          id="search-icon"
          className="material-symbols-outlined"
          onClick={!isDisabled ? handleSearchClick : undefined}
        >
          search
        </span>
      </div>
    </>
  );
};

export default Searchbar;



