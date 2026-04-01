import React, { useState, useEffect, useCallback } from "react";
import { Settings, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { postApi, userApi } from "../services";
import { Post, User } from "../types";
import PostCard from "../components/PostCard";
import ImagePreview from "../components/ImagePreview";
import ReplyModal from "../components/ReplyModal";

const ExploreView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    posts: Post[];
    users: User[];
  }>({ posts: [], users: [] });
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replyPost, setReplyPost] = useState<Post | null>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await userApi.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setIsLoading(true);
    try {
      const [users, posts] = await Promise.all([
        userApi.searchUsers(query),
        postApi.searchPosts(query),
      ]);
      setSearchResults({ users, posts });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(searchQuery);
  };

  const handleFollowSuggestion = async (userId: string) => {
    try {
      await userApi.followUser(userId);
      setSuggestions((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Follow failed:", error);
    }
  };

  return (
    <div className="flex flex-col bg-black min-h-full text-white">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 group focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all">
              <Search
                size={16}
                className="text-zinc-500 group-focus-within:text-sky-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users or posts"
                className="bg-transparent border-none text-zinc-100 text-[14px] ml-3 outline-none w-full placeholder:text-zinc-600"
              />
            </div>
            <button
              type="button"
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-100"
            >
              <Settings size={20} />
            </button>
          </form>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : isSearching ? (
        <div className="flex flex-col">
          {/* User Search Results */}
          {searchResults.users.length > 0 && (
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-xl font-extrabold mb-4 tracking-tight">
                Users
              </h2>
              <div className="space-y-4">
                {searchResults.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 py-1 cursor-pointer group"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <img
                      src={user.avatar}
                      className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
                      alt="avatar"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-zinc-100 truncate group-hover:underline">
                        {user.username}
                      </p>
                      <p className="text-zinc-500 text-[13px] truncate">
                        {user.handle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Search Results */}
          <div className="flex flex-col">
            {searchResults.posts.length > 0 ? (
              <>
                <h2 className="text-xl font-extrabold p-4 tracking-tight">
                  Posts
                </h2>
                {searchResults.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onImagePreview={setPreviewImage}
                    onReply={setReplyPost}
                  />
                ))}
              </>
            ) : searchResults.users.length === 0 ? (
              <div className="py-20 text-center text-zinc-500">
                No results found for "{searchQuery}"
              </div>
            ) : null}
          </div>

          <button
            onClick={() => setIsSearching(false)}
            className="p-4 text-sky-500 text-sm font-bold hover:bg-zinc-900 transition-colors text-left"
          >
            ← Back to trends
          </button>
        </div>
      ) : (
        <>
          <div className="p-4">
            <h2 className="text-xl font-extrabold mb-4 tracking-tight">
              Trends for you
            </h2>
            <div className="space-y-6 text-zinc-500 text-sm italic">
              Trends are coming soon...
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-4 p-4">
            <h2 className="text-xl font-extrabold mb-4 tracking-tight">
              Who to follow
            </h2>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 py-1">
                    <img
                      src={user.avatar}
                      className="w-10 h-10 rounded-full border border-zinc-800 object-cover cursor-pointer hover:opacity-80"
                      onClick={() => navigate(`/profile/${user.id}`)}
                      alt="avatar"
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <p className="font-bold text-[14px] text-zinc-100 truncate hover:underline">
                        {user.username}
                      </p>
                      <p className="text-zinc-500 text-[13px] truncate">
                        {user.handle}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFollowSuggestion(user.id)}
                      className="bg-zinc-100 text-black px-4 py-1.5 rounded-full text-[13px] font-bold hover:bg-zinc-300 transition-colors"
                    >
                      Follow
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">
                  No suggestions at the moment.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
      <ReplyModal
        isOpen={!!replyPost}
        onClose={() => setReplyPost(null)}
        post={replyPost}
        currentUser={currentUser}
        onReplySuccess={() => {
          if (isSearching) performSearch(searchQuery);
        }}
      />
    </div>
  );
};

export default ExploreView;
