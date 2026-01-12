
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Settings, MapPin, Link as LinkIcon } from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onSettings: () => void;
  onEditProfile: () => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onSettings, onEditProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('Posts');
  
  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center gap-7 px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight">{user.username}</h2>
            <p className="text-xs text-zinc-500">42 posts</p>
          </div>
        </div>
      </header>

      <div className="flex-1">
        {/* 精美科技感背景图 */}
        <div className="h-32 bg-zinc-900 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80" 
            className="w-full h-full object-cover" 
            alt="cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
          <div className="absolute -bottom-10 left-4">
            <div className="w-20 h-20 rounded-full border-4 border-black bg-zinc-900 overflow-hidden shadow-lg">
              <img src={user.avatar} className="w-full h-full object-cover" alt="profile" />
            </div>
          </div>
        </div>

        <div className="mt-12 px-4 space-y-3">
          <div className="flex justify-end gap-2">
            <button onClick={onSettings} className="p-2 border border-zinc-800 rounded-full hover:bg-zinc-900 transition-all">
              <Settings size={18} />
            </button>
            <button 
              onClick={onEditProfile}
              className="px-4 py-1.5 border border-zinc-800 rounded-full text-sm font-bold hover:bg-zinc-900 transition-all"
            >
              Edit profile
            </button>
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{user.username}</h1>
            <p className="text-[15px] text-zinc-500 leading-tight">{user.handle}</p>
          </div>

          <p className="text-[15px] text-zinc-100 leading-relaxed">{user.bio}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500 text-sm">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                <LinkIcon size={14} />
                <span className="text-sky-500 hover:underline">{user.website}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Joined October 2023</span>
            </div>
          </div>

          <div className="flex gap-4 pt-1">
            <button className="hover:underline flex gap-1 items-center text-sm">
              <span className="font-bold text-white">{user.following}</span>
              <span className="text-zinc-500">Following</span>
            </button>
            <button className="hover:underline flex gap-1 items-center text-sm">
              <span className="font-bold text-white">{user.followers}</span>
              <span className="text-zinc-500">Followers</span>
            </button>
          </div>
        </div>

        <div className="flex border-b border-zinc-800 mt-5">
          {['Posts', 'Replies', 'Media', 'Likes'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 text-center hover:bg-zinc-900/50 relative transition-colors"
            >
              <span className={`text-sm font-bold ${activeTab === tab ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[4px] bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="py-20 text-center flex flex-col items-center px-10">
          <h3 className="text-xl font-bold mb-1">No posts yet</h3>
          <p className="text-zinc-500 text-sm">When you share posts, they'll show up here.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
