import React, { useState, useEffect } from "react";
import { Pencil, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/user/userSlice";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const ProfileModal = ({ setShowEdit }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);

  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profile_picture: null,
    cover_photo: null,
    full_name: user?.full_name || "",
  });

  const [profilePreview, setProfilePreview] = useState(user?.profile_picture);
  const [coverPreview, setCoverPreview] = useState(user?.cover_photo);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview !== user?.profile_picture) {
        URL.revokeObjectURL(profilePreview);
      }
      if (coverPreview && coverPreview !== user?.cover_photo) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, profile_picture: file });
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, cover_photo: file });
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editForm.full_name?.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editForm.username?.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      const userData = new FormData();
      const {
        full_name,
        username,
        bio,
        location,
        profile_picture,
        cover_photo,
      } = editForm;

      userData.append("username", username.trim());
      userData.append("bio", bio || "");
      userData.append("location", location || "");
      userData.append("full_name", full_name.trim());
      if (profile_picture) userData.append("profile", profile_picture);
      if (cover_photo) userData.append("cover", cover_photo);

      const token = await getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      await dispatch(updateUser({ userData, token })).unwrap();
      toast.success("Profile updated successfully");
      setShowEdit(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-screen overflow-y-scroll bg-black/50 backdrop-blur-sm">
      <div className="max-w-2xl sm:py-6 mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <button
              onClick={() => setShowEdit(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            {/* Profile Picture */}
            <div className="flex flex-col items-start gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div
                className="group relative cursor-pointer"
                onClick={() =>
                  document.getElementById("profile_picture").click()
                }
              >
                <img
                  src={profilePreview || "https://via.placeholder.com/96"}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              </div>
              <input
                hidden
                type="file"
                accept="image/*"
                id="profile_picture"
                onChange={handleProfileChange}
              />
            </div>

            {/* Cover Photo */}
            <div className="flex flex-col items-start gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Cover Photo
              </label>
              <div
                className="group relative cursor-pointer"
                onClick={() => document.getElementById("cover_photo").click()}
              >
                <img
                  src={coverPreview || "https://via.placeholder.com/320x160"}
                  alt=""
                  className="w-80 h-40 rounded-lg object-cover bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              </div>
              <input
                hidden
                type="file"
                accept="image/*"
                id="cover_photo"
                onChange={handleCoverChange}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="Please enter your full name"
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                value={editForm.full_name}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="Please enter a username"
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                value={editForm.username}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-none"
                placeholder="Please enter a short bio"
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                value={editForm.bio}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="Please enter your location"
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                value={editForm.location}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setShowEdit(false)}
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
