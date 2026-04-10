import { BadgeCheck, X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

const StoryViewer = ({ viewStory, setViewStory }) => {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only for text and image stories (not video)
    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);

      const duration = 10000; // 10 seconds
      const stepTime = 100; // update every 100ms
      let elapsed = 0;

      intervalRef.current = setInterval(() => {
        elapsed += stepTime;
        setProgress((elapsed / duration) * 100);
      }, stepTime);

      timerRef.current = setTimeout(() => {
        setViewStory(null);
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [viewStory, setViewStory]);

  const handleClose = () => {
    setViewStory(null);
  };

  if (!viewStory) return null;

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt="Story"
            className="max-w-full max-h-screen object-contain rounded-lg"
          />
        );
      case "video":
        return (
          <video
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            className="max-h-screen rounded-lg"
            controls
            autoPlay
          />
        );
      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 h-screen z-50 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
        backgroundImage:
          viewStory.media_type === "image" || viewStory.media_type === "video"
            ? "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))"
            : "none",
      }}
    >
      {/* Progress Bar - Only for non-video stories */}
      {viewStory.media_type !== "video" && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
          <div
            className="h-full bg-white transition-all duration-100 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* User Info - Top Left */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded-full bg-black/50">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5 text-sm sm:text-base">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={16} className="text-blue-400" />
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white focus:outline-none bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
      >
        <X className="w-6 h-6 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* Content Wrapper */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>

      {/* Tap to next indicator (Optional) */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-xs">
        Tap anywhere to close
      </div>
    </div>
  );
};

export default StoryViewer;
