import React, { useState, useEffect } from "react";
import { Settings, MailPlus, Search, MessageCircle } from "lucide-react";
import { messageApi } from "../services";
import { Chat } from "../types";
import { LoadingView } from "../components/Loading";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { formatRelativeTime } from "../utils/time";

interface MessageViewProps {
  onSelectChat: (chat: Chat) => void;
}

const MessageView: React.FC<MessageViewProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await messageApi.getChats();
        setChats(data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingView message="Loading chats..." />;
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <Settings size={20} />
            </button>
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <MailPlus size={20} />
            </button>
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
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            description="Start a conversation to see messages here"
          />
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="p-4 flex gap-3 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <Avatar src={chat.user.avatar} size="md" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex gap-1 min-w-0 items-center">
                    <span className="font-bold text-[15px] truncate group-hover:underline">
                      {chat.user.username}
                    </span>
                    <span className="text-zinc-500 text-[14px] truncate">
                      {chat.user.handle}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[13px] flex-shrink-0 ml-2">
                    {chat.last_message &&
                      formatRelativeTime(chat.last_message.created_at)}
                  </span>
                </div>
                <p className="text-[14px] truncate text-zinc-500">
                  {chat.last_message?.content}
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
