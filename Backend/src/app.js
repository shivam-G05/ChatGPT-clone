const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const path=require('path')
// ✅ Correct CORS setup for cookies
app.use(cors({
  origin: ['http://localhost:5173', 'https://chatgpt-iet7.onrender.com'], // your React app URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'../public')));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get("*name",(req,res)=>{
  res.sendFile(path.join(__dirname,'../public/index.html'))
})
// ✅ Start server on port 5173
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

module.exports = app;
