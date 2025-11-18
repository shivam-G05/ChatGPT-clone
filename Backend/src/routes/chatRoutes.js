const express=require('express');
const router=express.Router();
const chatMiddleware=require('../middleware/auth');
const chatController=require('../controller/chatController');
const jwt=require('jsonwebtoken');
const messageModel=require('../models/message');
const chatModel=require('../models/chat');



const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

router.post('/',chatMiddleware.authUser,chatController.createChat);

router.get("/", verifyToken, chatController.getChat);

router.get('/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const messages = await messageModel.find({ chat: req.params.chatId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

router.post('/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const { content, role } = req.body;
    const userId = req.userId;
    const { chatId } = req.params;

    if (!chatId || !content || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = new messageModel({
      user: userId,
      chat: chatId,
      content,
      role,
    });

    await message.save();
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: "Failed to create message" });
  }
});

router.delete('/:chatId',verifyToken,async(req,res)=>{
  
  try{
    const {chatId}=req.params;
    const deletedChat=await chatModel.findByIdAndDelete(chatId);
    if(!deletedChat){
      return res.status(404).json({chat:"Chat not found"});
    }
    res.status(204).json({message:"chat deleted successfully"});
  }catch(error){
    res.status(500).json({message:"Error deleting chat"});
  }

});

  

module.exports=router;