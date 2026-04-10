import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice";
import toast from "react-hot-toast";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const connections = useSelector((state) => state.connections.connections);

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() && !image) {
      toast.error("Please enter a message or select an image");
      return;
    }

    if (sending) return;

    setSending(true);

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text.trim());
      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchUserMessages();

    return () => {
      dispatch(resetMessages());
    };
  }, [userId]);

  useEffect(() => {
    if (connections.length > 0) {
      const foundUser = connections.find(
        (connection) => connection._id === userId,
      );
      setUser(foundUser);
    }
  }, [connections, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(URL.createObjectURL(image));
      }
    };
  }, [image]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img
          src={user.profile_picture}
          alt=""
          className="size-8 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {sortedMessages.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No messages yet. Start a conversation!
            </p>
          ) : (
            sortedMessages.map((message, index) => {
              const isFromMe = message.to_user_id !== user._id;
              return (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${isFromMe ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${isFromMe ? "rounded-bl-none" : "rounded-br-none"}`}
                  >
                    {message.message_type === "image" && message.media_url && (
                      <img
                        src={message.media_url}
                        className="w-full max-w-sm rounded-lg mb-1"
                        alt=""
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          <input
            type="text"
            className="flex-1 outline-none text-slate-700"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
            disabled={sending}
          />

          <label htmlFor="image" className="cursor-pointer">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt=""
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <ImageIcon className="size-7 text-gray-400 hover:text-gray-600 transition" />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={sendMessage}
            disabled={sending || (!text.trim() && !image)}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full disabled:opacity-50 disabled:active:scale-100 transition"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
