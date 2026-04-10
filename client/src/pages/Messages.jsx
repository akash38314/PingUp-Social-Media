import React, { useEffect } from "react";
import { Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConnections } from "../features/connections/connectionsSlice";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const Messages = () => {
  const { connections } = useSelector((state) => state.connections);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  useEffect(() => {
    const loadConnections = async () => {
      const token = await getToken();
      if (token) {
        dispatch(fetchConnections(token));
      }
    };
    loadConnections();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected Users */}
        <div className="flex flex-col gap-3">
          {connections?.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No connections yet</p>
              <p className="text-sm mt-2">
                Go to Discover page to find people to connect with
              </p>
            </div>
          ) : (
            connections?.map((user) => (
              <div
                key={user._id}
                className="max-w-xl flex items-center gap-5 p-6 bg-white shadow rounded-md"
              >
                <img
                  src={user.profile_picture}
                  alt=""
                  className="rounded-full size-12 object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{user.full_name}</p>
                  <p className="text-slate-500 text-sm">@{user.username}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {user.bio?.slice(0, 80)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="size-10 flex items-center justify-center rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 active:scale-95 transition cursor-pointer"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="size-10 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition cursor-pointer"
                    title="View Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
