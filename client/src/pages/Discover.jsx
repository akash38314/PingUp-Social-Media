import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";

const Discover = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (!input.trim()) {
        toast.error("Please enter something to search");
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();

        if (!token) {
          toast.error("Please login again");
          return;
        }

        const { data } = await api.post(
          "/api/user/discover",
          { input },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
        setInput("");
      }
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) {
        dispatch(fetchUser(token));
      }
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm focus:outline-none focus:border-indigo-400"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-wrap gap-6">
          {users.length === 0 && !loading ? (
            <p className="text-center text-gray-500 w-full py-10">
              No users found
            </p>
          ) : (
            users.map((user) => <UserCard user={user} key={user._id} />)
          )}
        </div>

        {/* Loading */}
        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
};

export default Discover;
