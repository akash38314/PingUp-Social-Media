import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

// Add User Story
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file;
        let media_url = '';

        // upload media to imagekit
        if (media_type === 'image' || media_type === 'video') {
            if (!media) {
                return res.json({ success: false, message: "Media file is required for image/video story" });
            }
            const fileBuffer = fs.readFileSync(media.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: `${Date.now()}_${media.originalname}`,
                folder: "stories",
            });
            media_url = response.url;
        }

        // create story
        const story = await Story.create({
            user: userId,
            content: content || '',
            media_url,
            media_type: media_type || 'text',
            background_color: background_color || '#4f46e5',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });

        // schedule story deletion after 24 hours
        await inngest.send({
            name: 'app/story.delete',
            data: { storyId: story._id }
        });

        res.json({ success: true, story });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get User Stories
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);

        // User connections and followings 
        const userIds = [userId, ...(user?.connections || []), ...(user?.following || [])];

        const stories = await Story.find({
            user: { $in: userIds },
            expiresAt: { $gt: new Date() } // Only show non-expired stories
        }).populate('user').sort({ createdAt: -1 });

        res.json({ success: true, stories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete Story (Manual/Automated)
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        
        const story = await Story.findByIdAndDelete(storyId);
        
        if (!story) {
            return res.json({ success: false, message: "Story not found" });
        }
        
        res.json({ success: true, message: "Story deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Single Story
export const getStoryById = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await Story.findById(storyId).populate('user');
        
        if (!story) {
            return res.json({ success: false, message: "Story not found" });
        }
        
        // Check if story is expired
        if (story.expiresAt < new Date()) {
            await Story.findByIdAndDelete(storyId);
            return res.json({ success: false, message: "Story has expired" });
        }
        
        res.json({ success: true, story });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};