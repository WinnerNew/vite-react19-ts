
import React, { useState, useEffect } from 'react';
import { Settings, MailPlus, Search } from 'lucide-react';
import { messageApi } from '../services/api';
import { Chat } from '../types';

interface MessageViewProps {
  onSelectChat: (id: string) => void;
}

const MessageView: React.FC<MessageViewProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const data = await messageApi.getChats();
        setChats(data);
      } catch (err) {
        setError('Failed to load chats');
        console.error('Error fetching chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-black">
        <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
            <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Settings size={20} /></button>
              <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><MailPlus size={20} /></button>
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 group focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <Search size={16} className="text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search Direct Messages" 
                className="bg-transparent border-none text-[14px] ml-3 outline-none w-full placeholder:text-zinc-600" 
              />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500">Loading chats...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-black">
        <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
            <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Settings size={20} /></button>
              <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><MailPlus size={20} /></button>
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 group focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <Search size={16} className="text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search Direct Messages" 
                className="bg-transparent border-none text-[14px] ml-3 outline-none w-full placeholder:text-zinc-600" 
              />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Settings size={20} /></button>
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><MailPlus size={20} /></button>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 group focus-within:ring-1 focus-within:ring-sky-500 transition-all">
            <Search size={16} className="text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search Direct Messages" 
              className="bg-transparent border-none text-[14px] ml-3 outline-none w-full placeholder:text-zinc-600" 
            />
          </div>
        </div>
      </header>

      <div className="divide-y divide-zinc-800">
        {chats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="text-center">
              <div className="text-zinc-500 mb-2">No messages yet</div>
              <div className="text-zinc-600 text-sm">Start a conversation to see messages here</div>
            </div>
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => onSelectChat(chat.id)}
              className="p-4 flex gap-3 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <img src={chat.participant.avatar} className="w-12 h-12 rounded-full border border-zinc-800 object-cover" />
                {chat.unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-sky-500 rounded-full border-2 border-black" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex gap-1 min-w-0 items-center">
                    <span className="font-bold text-[15px] truncate group-hover:underline">{chat.participant.username}</span>
                    <span className="text-zinc-500 text-[14px] truncate">{chat.participant.handle}</span>
                  </div>
                  <span className="text-zinc-500 text-[13px] flex-shrink-0 ml-2">Oct 24</span>
                </div>
                <p className={`text-[14px] truncate ${chat.unreadCount > 0 ? 'text-zinc-100 font-medium' : 'text-zinc-500'}`}>
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageView;
