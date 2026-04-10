import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_VIDEO_SIZE_MB = 50; // MB

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB}MB.`);
          setMedia(null);
          setPreviewUrl(null);
          return;
        }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            toast.error("Video duration cannot exceed 1 minute.");
            setMedia(null);
            setPreviewUrl(null);
          } else {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setText("");
            setMode("media");
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image")) {
        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
        setText("");
        setMode("media");
      }
    }
  };

  const handleCreateStory = async () => {
    const media_type =
      mode === "media"
        ? media?.type.startsWith("image")
          ? "image"
          : "video"
        : "text";

    if (media_type === "text" && !text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("content", text.trim());
    formData.append("media_type", media_type);
    if (media) formData.append("media", media);
    formData.append("background_color", background);

    const token = await getToken();
    if (!token) {
      toast.error("Please login again");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/api/story/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setShowModal(false);
        toast.success("Story created successfully");
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="text-white p-2 cursor-pointer hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        {/* Story Preview Area */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none placeholder-white/50"
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.target.value)}
              value={text}
              maxLength={200}
            />
          )}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                alt="Story preview"
                className="object-contain max-h-full"
              />
            ) : (
              <video
                src={previewUrl}
                className="object-contain max-h-full"
                controls
              />
            ))}
        </div>

        {/* Background Color Picker */}
        <div className="flex mt-4 gap-2">
          {bgColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ring-offset-2 cursor-pointer transition ${background === color ? "ring-2 ring-white" : "ring-gray-400"}`}
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>

        {/* Mode Selection Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
              setText("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer transition ${mode === "text" ? "bg-white text-black" : "bg-zinc-800 hover:bg-zinc-700"}`}
          >
            <TextIcon size={18} /> Text
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer transition ${mode === "media" ? "bg-white text-black" : "bg-zinc-800 hover:bg-zinc-700"}`}
          >
            <input
              onChange={handleMediaUpload}
              type="file"
              accept="image/*, video/*"
              className="hidden"
            />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        {/* Create Button */}
        <button
          onClick={() => handleCreateStory()}
          disabled={loading}
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:active:scale-100"
        >
          <Sparkle size={18} /> {loading ? "Creating..." : "Create Story"}
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
