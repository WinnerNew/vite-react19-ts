import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { userApi } from "../services/api";
import { User } from "../types";

interface FollowListViewProps {
  currentUser: User;
}

const FollowListView: React.FC<FollowListViewProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    location.pathname.endsWith("/following") ? "following" : "followers",
  );

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [profileData, listData] = await Promise.all([
        userApi.getProfile(id),
        activeTab === "followers"
          ? userApi.getFollowers(id)
          : userApi.getFollowing(id),
      ]);
      setProfileUser(profileData);
      setUsers(listData);
    } catch (error) {
      console.error("Failed to fetch follow list:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollow = async (e: React.MouseEvent, targetUser: User) => {
    e.stopPropagation();
    try {
      await userApi.followUser(targetUser.id);
      // 局部更新列表状态
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                isFollowing: !u.isFollowing,
                followers: u.followers + (!u.isFollowing ? 1 : -1),
              }
            : u,
        ),
      );
    } catch (error) {
      console.error("Follow action failed:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center gap-7 px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight">
              {profileUser?.username || "Loading..."}
            </h2>
            <p className="text-xs text-zinc-500">
              @{profileUser?.handle || "..."}
            </p>
          </div>
        </div>
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("followers")}
            className="flex-1 py-4 text-center hover:bg-zinc-900/50 relative transition-colors"
          >
            <span
              className={`text-sm font-bold ${activeTab === "followers" ? "text-zinc-100" : "text-zinc-500"}`}
            >
              Followers
            </span>
            {activeTab === "followers" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[4px] bg-sky-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className="flex-1 py-4 text-center hover:bg-zinc-900/50 relative transition-colors"
          >
            <span
              className={`text-sm font-bold ${activeTab === "following" ? "text-zinc-100" : "text-zinc-500"}`}
            >
              Following
            </span>
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[4px] bg-sky-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : users.length > 0 ? (
          <div className="flex flex-col">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex items-center justify-between p-4 hover:bg-zinc-900/50 cursor-pointer transition-colors border-b border-zinc-900"
              >
                <div className="flex gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                    alt={user.username}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[15px] truncate hover:underline">
                      {user.username}
                    </span>
                    <span className="text-zinc-500 text-[14px] truncate">
                      @{user.handle}
                    </span>
                    {user.bio && (
                      <p className="text-[14px] text-zinc-300 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
                {currentUser.id !== user.id && (
                  <button
                    onClick={(e) => handleFollow(e, user)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                      user.isFollowing
                        ? "border border-zinc-800 text-white hover:border-red-900 hover:text-red-500 hover:bg-red-950/20"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center px-10">
            <h3 className="text-xl font-bold mb-1">
              {activeTab === "followers"
                ? "No followers yet"
                : "Not following anyone yet"}
            </h3>
            <p className="text-zinc-500 text-sm">
              {activeTab === "followers"
                ? "When someone follows this account, they'll show up here."
                : "When this account follows someone, they'll show up here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowListView;
