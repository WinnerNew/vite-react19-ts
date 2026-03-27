import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import { Post } from "../types";

import { useNavigate } from "react-router-dom";
import { postApi } from "../services/api";

interface PostCardProps {
  post: Post;
  onImagePreview: (src: string) => void;
  onReply: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onImagePreview,
  onReply,
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [reposted, setReposted] = useState(post.isReposted || false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [repostCount, setRepostCount] = useState(post.repostsCount);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // 乐观更新
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await postApi.likePost(post.id);
    } catch (error) {
      // 失败回滚
      setLiked(!newLiked);
      setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
      console.error("Failed to like:", error);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // 乐观更新
    const newReposted = !reposted;
    setReposted(newReposted);
    setRepostCount((prev) => (newReposted ? prev + 1 : prev - 1));

    try {
      await postApi.repostPost(post.id);
    } catch (error) {
      // 失败回滚
      setReposted(!newReposted);
      setRepostCount((prev) => (!newReposted ? prev + 1 : prev - 1));
      console.error("Failed to repost:", error);
    }
  };

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="flex w-full overflow-hidden border-b border-zinc-900 bg-black p-4 transition-colors hover:bg-zinc-900/30 cursor-pointer"
    >
      {/* Avatar Section */}
      <div
        className="flex-shrink-0 mr-3 z-10"
        onClick={(e) => {
          e.stopPropagation();
          if (post.author) navigate(`/profile/${post.author.id}`);
        }}
      >
        {post.author ? (
          <img
            src={post.author.avatar}
            alt={post.author.username}
            loading="lazy"
            className="h-10 w-10 rounded-full border border-zinc-900 object-cover shadow-sm bg-zinc-900 hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border border-zinc-900 bg-zinc-800" />
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex min-w-0 items-center gap-1">
            {post.author ? (
              <div
                className="flex items-center gap-1 min-w-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${post.author.id}`);
                }}
              >
                <span className="truncate text-[15px] font-bold text-zinc-100 hover:underline">
                  {post.author.username}
                </span>
                <span className="truncate text-[14px] text-zinc-500">
                  {post.author.handle}
                </span>
              </div>
            ) : (
              <span className="text-[15px] font-bold text-zinc-500">
                Deleted User
              </span>
            )}
            <span className="flex-shrink-0 text-[14px] text-zinc-500">
              · {post.timestamp}
            </span>
          </div>
          <button className="rounded-full p-1.5 text-zinc-600 transition-colors hover:bg-sky-500/10 hover:text-sky-500">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Reply Hint */}
        {post.parentId && post.parentPost && (
          <p className="text-zinc-500 text-[14px] mb-1">
            Replying to{" "}
            <span className="text-sky-500">
              @{post.parentPost.author.handle}
            </span>
          </p>
        )}

        {/* Text Content */}
        <p className="break-words text-[15px] leading-normal text-zinc-200">
          {post.content}
        </p>

        {/* Media Section with Progressive Loading */}
        {post.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ opacity: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onImagePreview(post.image!);
            }}
            className="relative mt-3 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            style={{ maxHeight: "512px" }}
          >
            {/* 骨架屏占位 */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-zinc-800 rounded-full border-t-zinc-600 animate-spin" />
              </div>
            )}
            <img
              src={post.image}
              alt="post media"
              className={`block w-full h-auto max-h-[512px] object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          </motion.div>
        )}

        {/* Interaction Bar */}
        <div className="mt-3 flex max-w-[340px] justify-between text-zinc-500 -ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReply(post);
            }}
            className="group flex items-center gap-1 transition-colors hover:text-sky-500"
          >
            <div className="rounded-full p-2 transition-colors group-hover:bg-sky-500/10">
              <MessageCircle size={18} />
            </div>
            <span className="text-[13px] font-medium">{post.repliesCount}</span>
          </button>

          <button
            onClick={handleRepost}
            className={`group flex items-center gap-1 transition-colors ${
              reposted ? "text-green-500" : "hover:text-green-500"
            }`}
          >
            <div
              className={`rounded-full p-2 transition-colors ${
                reposted ? "bg-green-500/10" : "group-hover:bg-green-500/10"
              }`}
            >
              <Repeat2 size={18} />
            </div>
            <span className="text-[13px] font-medium">{repostCount}</span>
          </button>

          <button
            onClick={handleLike}
            className={`group flex items-center gap-1 transition-colors ${
              liked ? "text-rose-500" : "hover:text-rose-500"
            }`}
          >
            <div
              className={`rounded-full p-2 transition-colors ${
                liked ? "bg-rose-500/10" : "group-hover:bg-rose-500/10"
              }`}
            >
              <Heart
                size={18}
                className={liked ? "fill-rose-500 text-rose-500" : ""}
              />
            </div>
            <span
              className={`text-[13px] font-medium ${liked ? "text-rose-500" : ""}`}
            >
              {likeCount}
            </span>
          </button>

          <button className="group flex items-center rounded-full p-2 transition-colors hover:bg-sky-500/10 hover:text-sky-500">
            <Share size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
