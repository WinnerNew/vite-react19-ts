
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, List, MapPin, Globe } from 'lucide-react';
import { Post } from '../types';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, post }) => {
  const [text, setText] = useState('');

  if (!post) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col pt-safe"
        >
          <header className="p-3 flex items-center justify-between border-b border-gray-800">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <button 
              disabled={!text.trim()}
              className={`bg-sky-500 text-white font-bold px-4 py-1.5 rounded-full transition-opacity ${!text.trim() ? 'opacity-50' : 'opacity-100'}`}
            >
              Reply
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Original Post Snippet */}
            <div className="flex gap-3 pb-4 relative">
              <div className="flex flex-col items-center">
                <img src={post.author.avatar} className="w-10 h-10 rounded-full" />
                <div className="w-0.5 flex-1 bg-gray-800 my-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-[15px]">{post.author.username}</span>
                  <span className="text-gray-500 text-[14px]">{post.author.handle}</span>
                </div>
                <p className="text-[15px] text-gray-300">{post.content}</p>
                <p className="text-sky-500 text-sm mt-2">Replying to <span className="hover:underline">{post.author.handle}</span></p>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <img src="https://picsum.photos/seed/me/200" className="w-10 h-10 rounded-full" />
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Post your reply"
                className="flex-1 bg-transparent text-xl border-none outline-none resize-none pt-1"
                rows={6}
              />
            </div>
          </div>

          <div className="p-3 border-t border-gray-800 flex items-center justify-between text-sky-500">
             <div className="flex gap-4">
               <Image className="w-5 h-5 cursor-pointer" />
               <List className="w-5 h-5 cursor-pointer" />
               <MapPin className="w-5 h-5 cursor-pointer" />
             </div>
             <div className="w-6 h-6 rounded-full border border-gray-800 flex items-center justify-center text-[10px] text-gray-500">
               {text.length}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReplyModal;
