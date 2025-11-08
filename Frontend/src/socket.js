// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://chatgpt-my1m.onrender.com", { withCredentials: true });
export default socket;
