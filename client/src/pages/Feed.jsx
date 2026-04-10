import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeeds(dummyPostsData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No posts yet</p>
          ) : (
            feeds.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>

      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            className="w-75 h-50 rounded-md"
            alt=""
          />
          <p className="text-slate-600">Email marketing</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use platform
            built for results.
          </p>
        </div>
        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
