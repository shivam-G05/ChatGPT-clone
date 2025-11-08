// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://chatgpt-iet7.onrender.com", { withCredentials: true });
export default socket;
