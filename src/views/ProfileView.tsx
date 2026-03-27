import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Settings,
  MapPin,
  Link as LinkIcon,
  Loader2,
  Mail,
} from "lucide-react";
import { User, Post, Chat } from "../types";
import { userApi, messageApi } from "../services/api";
import PostCard from "../components/PostCard";
import ImagePreview from "../components/ImagePreview";
import ReplyModal from "../components/ReplyModal";

interface ProfileViewProps {
  currentUser: User;
  onLogout: () => void;
  onSettings: () => void;
  onEditProfile: () => void;
  onBack: () => void;
  onSelectChat: (chat: Chat) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSettings,
  onEditProfile,
  onBack,
  onSelectChat,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replyPost, setReplyPost] = useState<Post | null>(null);

  const isOwnProfile = !id || id === currentUser.id;

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    const targetId = id || currentUser.id;
    try {
      const [userData, userPosts] = await Promise.all([
        userApi.getProfile(targetId),
        userApi.getUserPosts(targetId),
      ]);
      setProfileUser(userData);
      setPosts(userPosts);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser.id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollow = async () => {
    if (!profileUser || isOwnProfile || isFollowingLoading) return;
    setIsFollowingLoading(true);
    // 乐观更新
    const newIsFollowing = !profileUser.isFollowing;
    setProfileUser({
      ...profileUser,
      isFollowing: newIsFollowing,
      followers: profileUser.followers + (newIsFollowing ? 1 : -1),
    });

    try {
      await userApi.followUser(profileUser.id);
    } catch (error) {
      console.error("Follow failed:", error);
      // 回滚
      setProfileUser(profileUser);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleStartMessage = async () => {
    if (!profileUser || isOwnProfile) return;
    try {
      const chat = await messageApi.createChat(profileUser.id);
      onSelectChat(chat);
      navigate("/chat");
    } catch (error) {
      console.error("Failed to start message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white p-4">
        <p className="text-zinc-500 mb-4">User not found</p>
        <button
          onClick={() => navigate("/")}
          className="bg-white text-black px-4 py-2 rounded-full font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-black text-white">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center gap-7 px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight">
              {profileUser.username}
            </h2>
            <p className="text-xs text-zinc-500">{posts.length} posts</p>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="h-32 bg-zinc-900 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80"
            className="w-full h-full object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
          <div className="absolute -bottom-10 left-4">
            <div className="w-20 h-20 rounded-full border-4 border-black bg-zinc-900 overflow-hidden shadow-lg">
              <img
                src={profileUser.avatar}
                className="w-full h-full object-cover"
                alt="profile"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 px-4 space-y-3">
          <div className="flex justify-end gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={onSettings}
                  className="p-2 border border-zinc-800 rounded-full hover:bg-zinc-900 transition-all"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={onEditProfile}
                  className="px-4 py-1.5 border border-zinc-800 rounded-full text-sm font-bold hover:bg-zinc-900 transition-all"
                >
                  Edit profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartMessage}
                  className="p-2 border border-zinc-800 rounded-full hover:bg-zinc-900 transition-all text-white"
                >
                  <Mail size={18} />
                </button>
                <button
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${
                    profileUser.isFollowing
                      ? "border border-zinc-800 text-white hover:border-red-900 hover:text-red-500 hover:bg-red-950/20"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {profileUser.isFollowing ? "Following" : "Follow"}
                </button>
              </>
            )}
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {profileUser.username}
            </h1>
            <p className="text-[15px] text-zinc-500 leading-tight">
              {profileUser.handle}
            </p>
          </div>

          <p className="text-[15px] text-zinc-100 leading-relaxed">
            {profileUser.bio}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500 text-sm">
            {profileUser.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center gap-1">
                <LinkIcon size={14} />
                <span className="text-sky-500 hover:underline">
                  {profileUser.website}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Joined October 2023</span>
            </div>
          </div>

          <div className="flex gap-4 pt-1">
            <button className="hover:underline flex gap-1 items-center text-sm">
              <span className="font-bold text-white">
                {profileUser.following}
              </span>
              <span className="text-zinc-500">Following</span>
            </button>
            <button className="hover:underline flex gap-1 items-center text-sm">
              <span className="font-bold text-white">
                {profileUser.followers}
              </span>
              <span className="text-zinc-500">Followers</span>
            </button>
          </div>
        </div>

        <div className="flex border-b border-zinc-800 mt-5">
          {["Posts", "Replies", "Media", "Likes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 text-center hover:bg-zinc-900/50 relative transition-colors"
            >
              <span
                className={`text-sm font-bold ${activeTab === tab ? "text-zinc-100" : "text-zinc-500"}`}
              >
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[4px] bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onImagePreview={setPreviewImage}
                onReply={setReplyPost}
              />
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center px-10">
              <h3 className="text-xl font-bold mb-1">No posts yet</h3>
              <p className="text-zinc-500 text-sm">
                When you share posts, they'll show up here.
              </p>
            </div>
          )}
        </div>
      </div>

      <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
      <ReplyModal
        isOpen={!!replyPost}
        onClose={() => setReplyPost(null)}
        post={replyPost}
        currentUser={currentUser}
        onReplySuccess={() => fetchProfileData()}
      />
    </div>
  );
};

export default ProfileView;
