import React from "react";
import { MapPin, MessageCircle, Plus, UserPlus, UserCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";

const UserCard = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isFollowing = currentUser?.following?.includes(user._id);
  const isConnected = currentUser?.connections?.includes(user._id);
  const isSelf = currentUser?._id === user._id;

  const handleFollow = async () => {
    if (isSelf) {
      toast.error("You cannot follow yourself");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleConnectionRequest = async () => {
    if (isSelf) {
      toast.error("You cannot connect with yourself");
      return;
    }

    if (isConnected) {
      navigate("/messages/" + user._id);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Don't show self user card in discover
  if (isSelf) return null;

  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md bg-white hover:shadow-lg transition">
      <div className="text-center">
        <img
          src={user.profile_picture}
          alt=""
          className="rounded-full w-16 h-16 shadow-md mx-auto object-cover"
        />
        <p className="mt-4 font-semibold">{user.full_name}</p>
        {user.username && (
          <p className="text-gray-500 text-sm">@{user.username}</p>
        )}
        {user.bio && (
          <p className="text-gray-600 mt-2 text-center text-sm px-4 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        {user.location && (
          <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
            <MapPin className="w-3 h-3" /> {user.location}
          </div>
        )}
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <span className="font-semibold">{user.followers?.length || 0}</span>{" "}
          Followers
        </div>
      </div>

      <div className="flex mt-4 gap-2">
        {/* Follow Button */}
        <button
          onClick={handleFollow}
          disabled={isFollowing}
          className={`w-full py-2 rounded-md flex justify-center items-center gap-2 transition cursor-pointer ${
            isFollowing
              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          {isFollowing ? "Following" : "Follow"}
        </button>

        {/* Connection/Message Button */}
        <button
          onClick={handleConnectionRequest}
          className="flex items-center justify-center w-12 border border-gray-300 text-slate-500 rounded-md cursor-pointer active:scale-95 transition hover:bg-gray-50"
        >
          {isConnected ? (
            <MessageCircle className="w-5 h-5 text-indigo-500" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
