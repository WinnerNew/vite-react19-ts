import React, { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "../components/PostCard";
import ImagePreview from "../components/ImagePreview";
import ReplyModal from "../components/ReplyModal";
import { Post, User } from "../types";
import { Loader2, Image, List, MapPin } from "lucide-react";
import { postApi } from "../services/api";
import { useToast } from "../components/Toast";

interface HomeViewProps {
  currentUser: User;
}

const HomeView: React.FC<HomeViewProps> = ({ currentUser }) => {
  const [tab, setTab] = useState<"FOR_YOU" | "FOLLOWING">("FOR_YOU");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replyPost, setReplyPost] = useState<Post | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [composeText, setComposeText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const { showToast } = useToast();

  const observerTarget = useRef<HTMLDivElement>(null);

  const handleCompose = async () => {
    if (!composeText.trim() || isComposing) return;
    setIsComposing(true);
    try {
      const newPost = await postApi.createPost(composeText);
      setPosts((prev) => [newPost, ...prev]);
      setComposeText("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create post";
      showToast(errorMessage, "error");
    } finally {
      setIsComposing(false);
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await postApi.getPosts(5, offset, tab);
      const newPosts = response.items;

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setOffset((prev) => prev + newPosts.length);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load posts";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, offset, hasMore, tab, showToast]);

  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    setOffset(0);
    setHasMore(true);

    try {
      const response = await postApi.getPosts(5, 0, tab);
      setPosts(response.items);
      setOffset(response.items.length);
      setHasMore(response.items.length > 0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh posts";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [tab, showToast]);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 },
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMorePosts]);

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center px-4 py-3 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)]">
          <img
            src={currentUser.avatar}
            alt="me"
            className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
          />
          <div className="mx-auto">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
              <g>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </g>
            </svg>
          </div>
          <div className="w-8"></div>
        </div>

        <div className="flex">
          {(["FOR_YOU", "FOLLOWING"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-4 text-center hover:bg-zinc-900/50 relative group transition-colors"
            >
              <span
                className={`text-[15px] font-bold ${tab === t ? "text-zinc-100" : "text-zinc-500"}`}
              >
                {t === "FOR_YOU" ? "For you" : "Following"}
              </span>
              {tab === t && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[4.5px] bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Inline Compose Area */}
      <div className="p-4 border-b border-zinc-900 flex gap-3">
        <img
          src={currentUser.avatar}
          className="w-10 h-10 rounded-full object-cover"
          alt="avatar"
        />
        <div className="flex-1 flex flex-col gap-3">
          <textarea
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent text-xl border-none outline-none resize-none pt-2 text-zinc-100 placeholder:text-zinc-500"
            rows={2}
          />
          <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
            <div className="flex gap-4 text-sky-500">
              <Image
                size={20}
                className="cursor-pointer hover:bg-sky-500/10 rounded-full"
              />
              <List
                size={20}
                className="cursor-pointer hover:bg-sky-500/10 rounded-full"
              />
              <MapPin
                size={20}
                className="cursor-pointer hover:bg-sky-500/10 rounded-full"
              />
            </div>
            <button
              onClick={handleCompose}
              disabled={!composeText.trim() || isComposing}
              className={`bg-sky-500 text-white font-bold px-5 py-1.5 rounded-full transition-opacity ${!composeText.trim() || isComposing ? "opacity-50" : "opacity-100"}`}
            >
              {isComposing ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onImagePreview={setPreviewImage}
            onReply={setReplyPost}
          />
        ))}
      </div>

      <div ref={observerTarget} className="flex justify-center p-8">
        {isLoading && <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />}
      </div>

      <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
      <ReplyModal
        isOpen={!!replyPost}
        onClose={() => setReplyPost(null)}
        post={replyPost}
        currentUser={currentUser}
        onReplySuccess={(newReply) => {
          console.log("Reply sent:", newReply);
        }}
      />
    </div>
  );
};

export default HomeView;
