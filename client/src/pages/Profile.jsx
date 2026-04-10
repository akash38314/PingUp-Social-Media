import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import moment from "moment";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (id) => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const { data } = await api.post(
        `/api/user/profiles`,
        { profileId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = profileId || currentUser?._id;
    if (id) {
      fetchUser(id);
    }
  }, [profileId, currentUser?._id]);

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No posts yet</p>
              ) : (
                posts.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="flex flex-wrap gap-4 mt-6">
              {posts.filter((post) => post.image_urls?.length > 0).length ===
              0 ? (
                <p className="text-gray-500 text-center w-full py-10">
                  No media posts yet
                </p>
              ) : (
                posts.map((post) =>
                  post.image_urls?.map((image, index) => (
                    <Link
                      target="_blank"
                      to={image}
                      key={`${post._id}-${index}`}
                      className="relative group"
                    >
                      <img
                        src={image}
                        className="w-64 aspect-video object-cover rounded-lg"
                        alt=""
                      />
                      <p className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300 rounded-br-lg">
                        Posted {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  )),
                )
              )}
            </div>
          )}

          {activeTab === "likes" && (
            <div className="mt-6 text-center py-10 text-gray-500">
              <p>Posts you've liked will appear here</p>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <ProfileModal
          setShowEdit={setShowEdit}
          user={user}
          onUpdate={fetchUser}
        />
      )}
    </div>
  );
};

export default Profile;
