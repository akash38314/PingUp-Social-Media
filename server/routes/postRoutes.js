import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/protect.js'; // ← FIX: middlewares → middleware
import { addPost, getFeedPosts, likePost } from '../controllers/postController.js';

const postRouter = express.Router();

// Create a new post (with up to 4 images)
postRouter.post('/add', protect, upload.array('images', 4), addPost);

// Get feed posts (from user + connections + following)
postRouter.get('/feed', protect, getFeedPosts);

// Like or Unlike a post
postRouter.post('/like', protect, likePost);

export default postRouter;