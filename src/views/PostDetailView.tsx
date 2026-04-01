import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { Post, User } from "../types";
import { postApi } from "../services";
import PostCard from "../components/PostCard";
import ReplyModal from "../components/ReplyModal";
import ImagePreview from "../components/ImagePreview";

interface PostDetailViewProps {
  currentUser: User;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyPost, setReplyPost] = useState<Post | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchPostDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [postData, repliesData] = await Promise.all([
        postApi.getPost(id),
        postApi.getReplies(id),
      ]);
      setPost(postData);
      setReplies(repliesData);
    } catch (error) {
      console.error("Failed to fetch post detail:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const handleLike = async () => {
    if (!post) return;
    const newLiked = !post.is_liked;
    setPost({
      ...post,
      is_liked: newLiked,
      likes_count: post.likes_count + (newLiked ? 1 : -1),
    });
    try {
      await postApi.likePost(post.id);
    } catch (error) {
      console.error("Failed to like:", error);
      fetchPostDetail();
    }
  };

  const handleRepost = async () => {
    if (!post) return;
    const newReposted = !post.is_reposted;
    setPost({
      ...post,
      is_reposted: newReposted,
      reposts_count: post.reposts_count + (newReposted ? 1 : -1),
    });
    try {
      await postApi.repostPost(post.id);
    } catch (error) {
      console.error("Failed to repost:", error);
      fetchPostDetail();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white p-4">
        <p className="text-zinc-500 mb-4">Post not found</p>
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
    <div className="flex flex-col min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center p-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-900 rounded-full transition-colors mr-4"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Post</h2>
      </header>

      {post.parent_post && (
        <div className="border-b border-zinc-900">
          <PostCard
            post={post.parent_post}
            onImagePreview={setPreviewImage}
            onReply={setReplyPost}
          />
        </div>
      )}

      <div className="p-4 border-b border-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/profile/${post.author.id}`)}
          >
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-bold text-[16px]">
                {post.author.username}
              </span>
              <span className="text-zinc-500 text-[15px]">
                {post.author.handle}
              </span>
            </div>
          </div>
          <button className="text-zinc-500 p-2 hover:bg-sky-500/10 hover:text-sky-500 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {post.parent_id && (
          <p className="text-zinc-500 text-[15px] mb-2 -mt-2">
            Replying to{" "}
            <span className="text-sky-500">
              @{post.parent_post?.author.handle || "user"}
            </span>
          </p>
        )}

        <p className="text-[22px] leading-relaxed mb-4 whitespace-pre-wrap text-zinc-100">
          {post.content}
        </p>

        {post.image && (
          <div
            className="mb-4 rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer"
            onClick={() => setPreviewImage(post.image!)}
          >
            <img
              src={post.image}
              alt="post media"
              className="w-full h-auto max-h-[600px] object-cover"
            />
          </div>
        )}

        <div className="text-zinc-500 text-[15px] mb-4 pb-4 border-b border-zinc-900">
          {post.full_timestamp}
        </div>

        <div className="flex gap-5 mb-4 py-1 border-b border-zinc-900 pb-4">
          <div className="flex gap-1 items-center">
            <span className="font-bold text-white">{post.reposts_count}</span>
            <span className="text-zinc-500">Reposts</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="font-bold text-white">{post.likes_count}</span>
            <span className="text-zinc-500">Likes</span>
          </div>
        </div>

        <div className="flex justify-around py-1 text-zinc-500">
          <button
            onClick={() => setReplyPost(post)}
            className="p-2 hover:bg-sky-500/10 hover:text-sky-500 rounded-full transition-colors"
          >
            <MessageCircle size={22} />
          </button>
          <button
            onClick={handleRepost}
            className={`p-2 hover:bg-green-500/10 hover:text-green-500 rounded-full transition-colors ${post.is_reposted ? "text-green-500" : ""}`}
          >
            <Repeat2 size={22} />
          </button>
          <button
            onClick={handleLike}
            className={`p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors ${post.is_liked ? "text-rose-500" : ""}`}
          >
            <Heart size={22} className={post.is_liked ? "fill-rose-500" : ""} />
          </button>
          <button className="p-2 hover:bg-sky-500/10 hover:text-sky-500 rounded-full transition-colors">
            <Share size={22} />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {replies.map((reply) => (
          <PostCard
            key={reply.id}
            post={reply}
            onImagePreview={setPreviewImage}
            onReply={setReplyPost}
          />
        ))}
      </div>

      <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
      <ReplyModal
        isOpen={!!replyPost}
        onClose={() => setReplyPost(null)}
        post={replyPost}
        currentUser={currentUser}
        onReplySuccess={() => fetchPostDetail()}
      />
    </div>
  );
};

export default PostDetailView;
