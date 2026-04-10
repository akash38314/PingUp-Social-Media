import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/protect.js'; // ← FIX: middlewares → middleware
import { addUserStory, getStories } from '../controllers/storyController.js';

const storyRouter = express.Router();

// Create a new story (text/image/video)
storyRouter.post('/create', protect, upload.single('media'), addUserStory);

// Get all stories from user + connections + following
storyRouter.get('/get', protect, getStories);

export default storyRouter;