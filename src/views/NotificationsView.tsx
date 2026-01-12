
import React, { useState } from 'react';
import { Heart, User, Repeat2, Settings } from 'lucide-react';

const NotificationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const NOTIFS = [
    { id: 1, type: 'like', user: 'Design System', content: 'liked your post', time: '1h', avatar: 'https://picsum.photos/seed/design/200' },
    { id: 2, type: 'follow', user: 'Mobile Dev', content: 'followed you', time: '3h', avatar: 'https://picsum.photos/seed/dev/200' },
    { id: 3, type: 'repost', user: 'Product Hunt', content: 'reposted your insight', time: '5h', avatar: 'https://picsum.photos/seed/product/200' },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <h2 className="text-xl font-extrabold tracking-tight">Notifications</h2>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Settings size={20} /></button>
        </div>
        <div className="flex w-full">
          {['All', 'Verified', 'Mentions'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 text-center relative hover:bg-zinc-900/50 transition-colors group"
            >
              <span className={`text-[14px] font-bold ${activeTab === tab ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="divide-y divide-zinc-800">
        {NOTIFS.map(n => (
          <div key={n.id} className="p-4 flex gap-4 hover:bg-zinc-900/30 transition-colors cursor-pointer">
            <div className="flex-shrink-0 pt-1">
              {n.type === 'like' && <Heart size={22} className="text-pink-600 fill-pink-600" />}
              {n.type === 'follow' && <User size={22} className="text-sky-500 fill-sky-500" />}
              {n.type === 'repost' && <Repeat2 size={22} className="text-green-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <img src={n.avatar} className="w-8 h-8 rounded-full mb-2 border border-zinc-800" />
              <p className="text-[15px] leading-relaxed text-zinc-100">
                <span className="font-bold">{n.user}</span> <span className="text-zinc-400">{n.content}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;
