import express from 'express';
import { getChatMessages, sendMessage, sseController } from '../controllers/messageController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/protect.js'; // ← FIX: middlewares → middleware

const messageRouter = express.Router();

// SSE - Server Sent Events (Real-time)
messageRouter.get('/:userId', sseController);

// Send message (with optional image)
messageRouter.post('/send', protect, upload.single('image'), sendMessage);

// Get chat messages between two users
messageRouter.post('/get', protect, getChatMessages);

export default messageRouter;