const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const aiService = require('../services/ai');
const userModel = require('../models/user');
const messageModel = require('../models/message');
const { createMemory, queryMemory } = require('../services/vector');

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || '');
        if (!cookies.token) return next(new Error("Authentication error: No token provided"));

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);
            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket) => {

        socket.on('ai-message', async (message) => {

            // ============ 1) SAVE USER MESSAGE & VECTOR ============
            const [msgDoc, userVector] = await Promise.all([
                messageModel.create({
                    user: socket.user._id,
                    chat: message.chat,
                    content: message.message,
                    role: 'user'
                }),
                aiService.generateVector(message.message)
            ]);

            await createMemory({
                vectors: userVector,
                messageId: msgDoc._id,
                metadata: {
                    chat: message.chat,
                    user: socket.user._id,
                    text: message.message
                }
            });

            // ============ 2) GET LTM & CHAT HISTORY ============
            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: userVector,
                    limit: 3,
                    metadata: { user: socket.user._id }
                }),

                messageModel
                    .find({ chat: message.chat })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean()
                    .then(res => res.reverse())
            ]);

            // SHORT TERM MEMORY FORMAT
            const stm = chatHistory.map(item => ({
                role: item.role,
                parts: [{ text: item.content }]
            }));

            // LONG TERM MEMORY FORMAT
            const ltm = [
                {
                    role: "user",
                    parts: [{
                        text: `Use this context if useful:\n${memory.map(v => v.metadata.text).join("\n")}`
                    }]
                }
            ];

            const messagesForAI = [...ltm, ...stm];

            // ============ 3) CALL AI WITH TOOL SUPPORT ============
            let aiResponse = await aiService.generateResponse(messagesForAI);

            // ============ 4) HANDLE TOOL CALL LOOP ============
            while (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
                const toolCall = aiResponse.toolCalls[0];

                const toolResult = await aiService.executeTool(toolCall);

                aiResponse = await aiService.generateResponse([
                    ...messagesForAI,
                    {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    }
                ]);
            }

            // FINAL TEXT RESPONSE
            const finalResponse = aiResponse.output_text;

            socket.emit("ai-response", {
                content: finalResponse,
                chat: message.chat
            });

            // ============ 5) SAVE MODEL RESPONSE & VECTOR ============
            const [responseDoc, responseVector] = await Promise.all([
                messageModel.create({
                    user: socket.user._id,
                    chat: message.chat,
                    content: finalResponse,
                    role: 'model'
                }),
                aiService.generateVector(finalResponse)
            ]);

            await createMemory({
                vectors: responseVector,
                messageId: responseDoc._id,
                metadata: {
                    chat: message.chat,
                    user: socket.user._id,
                    text: finalResponse
                }
            });

        });
    });
};

module.exports = initSocketServer;
