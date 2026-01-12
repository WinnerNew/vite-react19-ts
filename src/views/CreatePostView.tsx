
import React, { useState } from 'react';
import { X, Image, List, MapPin, Globe, Smile } from 'lucide-react';

interface CreatePostViewProps {
  onBack: () => void;
}

const CreatePostView: React.FC<CreatePostViewProps> = ({ onBack }) => {
  const [content, setContent] = useState('');

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="flex items-center justify-between px-4 py-2 pt-[env(safe-area-inset-top,8px)]">
        <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X size={22} /></button>
        <button 
          disabled={!content.trim()}
          onClick={onBack}
          className={`bg-sky-500 text-white font-bold px-5 py-1.5 rounded-full transition-all ${
            !content.trim() ? 'opacity-50' : 'hover:bg-sky-600 active:scale-95'
          }`}
        >
          Post
        </button>
      </header>

      <div className="flex-1 flex gap-3 px-4 pt-4">
        <div className="flex-shrink-0">
          <img src="https://picsum.photos/seed/me/200" className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
        </div>
        <div className="flex-1 flex flex-col">
          <button className="self-start text-sky-500 border border-zinc-800 rounded-full px-3 py-0.5 text-[13px] font-bold hover:bg-sky-500/5 transition-colors mb-4">
            Everyone
          </button>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is happening?!"
            className="bg-transparent border-none text-xl text-zinc-100 placeholder:text-zinc-600 outline-none resize-none w-full"
            rows={8}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        <button className="flex items-center gap-1.5 text-sky-500 text-[14px] font-bold mb-6 hover:bg-sky-500/5 px-2 py-1 rounded-full transition-colors -ml-1">
          <Globe size={16} />
          Everyone can reply
        </button>
        
        <div className="flex justify-between items-center text-sky-500">
          <div className="flex gap-4">
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors"><Image size={20} /></button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors"><List size={20} /></button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors"><Smile size={20} /></button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors"><MapPin size={20} /></button>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] ${content.length > 250 ? 'text-pink-500 border-pink-500' : 'text-zinc-500'}`}>
              {280 - content.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostView;
