
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from '../components/PostCard';
import ImagePreview from '../components/ImagePreview';
import ReplyModal from '../components/ReplyModal';
import { Post, User } from '../types';
import { Loader2 } from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
}

const generateMockPosts = (startIndex: number, count: number): Post[] => {
  const categories = ['Tech', 'Nature', 'Architecture', 'People', 'Travel', 'Art'];
  return Array.from({ length: count }).map((_, i) => {
    const id = (startIndex + i).toString();
    const category = categories[Math.floor(Math.random() * categories.length)];
    return {
      id,
      userId: `user-${id}`,
      author: {
        id: `user-${id}`,
        username: `Explorer_${id}`,
        handle: `@explorer_${id}`,
        avatar: `https://picsum.photos/seed/user${id}/200`,
        followers: Math.floor(Math.random() * 5000),
        following: Math.floor(Math.random() * 1000)
      },
      content: `This is dynamically loaded post number ${id}. Exploring the beauty of ${category} today! #InfiniteScroll #SocialH5`,
      timestamp: `${Math.floor(Math.random() * 24)}h`,
      likes: Math.floor(Math.random() * 500),
      reposts: Math.floor(Math.random() * 100),
      replies: Math.floor(Math.random() * 50),
      image: Math.random() > 0.3 ? `https://picsum.photos/seed/post${id}/800/600` : undefined
    };
  });
};

const HomeView: React.FC<HomeViewProps> = ({ currentUser }) => {
  const [tab, setTab] = useState<'FOR_YOU' | 'FOLLOWING'>('FOR_YOU');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replyPost, setReplyPost] = useState<Post | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newPosts = generateMockPosts(posts.length, 5);
    setPosts(prev => [...prev, ...newPosts]);
    setIsLoading(false);
  }, [posts.length, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMorePosts]);

  useEffect(() => {
    if (posts.length === 0) {
      loadMorePosts();
    }
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center px-4 py-3 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)]">
          <img src={currentUser.avatar} alt="me" className="w-8 h-8 rounded-full border border-zinc-800" />
          <div className="mx-auto">
             <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
               <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
             </svg>
          </div>
          <div className="w-8"></div>
        </div>

        <div className="flex">
          {(['FOR_YOU', 'FOLLOWING'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-4 text-center hover:bg-zinc-900/50 relative group transition-colors"
            >
              <span className={`text-[15px] font-bold ${tab === t ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {t === 'FOR_YOU' ? 'For you' : 'Following'}
              </span>
              {tab === t && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[4.5px] bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onImagePreview={setPreviewImage} 
            onReply={setReplyPost}
          />
        ))}
      </div>

      <div ref={observerTarget} className="flex justify-center p-8">
        {isLoading && (
          <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
        )}
      </div>

      <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
      <ReplyModal 
        isOpen={!!replyPost} 
        onClose={() => setReplyPost(null)} 
        post={replyPost} 
      />
    </div>
  );
};

export default HomeView;
