import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const StoriesBar = () => {
  const { getToken } = useAuth();
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);

  const fetchStories = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await api.get("/api/story/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setStories(data.stories || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchStories();

    // Optional: Auto-refresh stories every 2 minutes
    const interval = setInterval(fetchStories, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">
        {/* Add Story Card */}
        <div
          onClick={() => setShowModal(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700 text-center">
              Create Story
            </p>
          </div>
        </div>

        {/* Story Cards */}
        {stories.length === 0 ? (
          <div className="flex items-center justify-center min-w-60 text-gray-400 text-sm">
            No stories to show
          </div>
        ) : (
          stories.map((story) => (
            <div
              onClick={() => setViewStory(story)}
              key={story._id}
              className={`relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 overflow-hidden`}
            >
              {/* User Profile Picture */}
              <img
                src={story.user?.profile_picture}
                alt=""
                className="absolute size-8 top-3 left-3 z-10 rounded-full ring-2 ring-white shadow object-cover"
              />

              {/* Story Content Preview */}
              {story.content && (
                <p className="absolute top-18 left-3 text-white/80 text-xs truncate max-w-24 z-10 font-medium">
                  {story.content.slice(0, 30)}
                </p>
              )}

              {/* Time */}
              <p className="text-white absolute bottom-1 right-2 z-10 text-[10px] bg-black/30 px-1 rounded">
                {moment(story.createdAt).fromNow()}
              </p>

              {/* Media Background */}
              {story.media_type !== "text" && story.media_url && (
                <div className="absolute inset-0 rounded-lg bg-black overflow-hidden">
                  {story.media_type === "image" ? (
                    <img
                      src={story.media_url}
                      alt=""
                      className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    />
                  ) : (
                    <video
                      src={story.media_url}
                      className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    />
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />
      )}
      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default StoriesBar;
