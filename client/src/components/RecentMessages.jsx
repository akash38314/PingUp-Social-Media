import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const intervalRef = useRef(null);

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        // Group messages by sender and get the latest message for each sender
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id?._id;
          if (!senderId) return acc;

          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        // Sort messages by date (newest first)
        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setMessages(sortedMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMessages();
      intervalRef.current = setInterval(fetchRecentMessages, 30000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [user]);

  if (messages.length === 0) {
    return (
      <div className="bg-white max-w-xs mt-4 p-4 rounded-md shadow text-xs text-slate-800">
        <h3 className="font-semibold mb-4">Recent Messages</h3>
        <p className="text-gray-400 text-center py-4">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-xs mt-4 p-4 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold mb-4">Recent Messages</h3>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message) => (
          <Link
            to={`/messages/${message.from_user_id?._id}`}
            key={message._id}
            className="flex items-start gap-2 py-2 px-1 rounded-lg hover:bg-slate-100 transition"
          >
            <img
              src={message.from_user_id?.profile_picture}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm truncate">
                  {message.from_user_id?.full_name}
                </p>
                <p className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                  {moment(message.createdAt).fromNow()}
                </p>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className="text-gray-500 text-xs truncate">
                  {message.text ? message.text.slice(0, 30) : "📷 Media"}
                </p>
                {!message.seen && (
                  <span className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] flex-shrink-0">
                    1
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;
