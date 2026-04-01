import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Info, Image, Gift, Send, Loader2 } from "lucide-react";
import { messageApi } from "../services/api";
import { Message, Chat, User } from "../types";

interface ChatRoomViewProps {
  chat: Chat;
  currentUser: User;
  onBack: () => void;
}

const ChatRoomView: React.FC<ChatRoomViewProps> = ({
  chat,
  currentUser,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messageApi.getMessages(chat.id);
        if (data.length !== messages.length) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chat.id, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      const newMessage = await messageApi.sendMessage(chat.id, inputText);
      setMessages([...messages, newMessage]);
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[15px] font-bold leading-tight">
                {chat.user.username}
              </h2>
              <p className="text-[12px] text-zinc-500 leading-tight">
                {chat.user.handle}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20 text-center">
              <img
                src={chat.user.avatar}
                className="w-16 h-16 rounded-full mx-auto mb-4 border border-zinc-800 object-cover"
              />
              <h3 className="text-xl font-bold">{chat.user.username}</h3>
              <p className="text-zinc-500 text-sm">{chat.user.handle}</p>
              <div className="text-zinc-500 mt-10">
                No messages yet. Start the conversation!
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender.id === currentUser.id ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-[15px] leading-relaxed break-words ${
                    msg.sender.id === currentUser.id
                      ? "bg-sky-500 text-white rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[11px] text-zinc-500 mt-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="p-4 border-t border-zinc-800 pb-[calc(16px+env(safe-area-inset-bottom,0px))] bg-black">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sky-500">
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors">
              <Image size={20} />
            </button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors invisible xs:visible">
              <Gift size={20} />
            </button>
          </div>
          <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4 transition-all focus-within:ring-1 focus-within:ring-sky-500">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Start a new message"
              className="bg-transparent border-none text-zinc-100 text-[14px] py-2.5 outline-none w-full"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`${inputText.trim() ? "text-sky-500" : "text-zinc-700"} transition-colors ml-2`}
            >
              <Send
                size={18}
                fill={inputText.trim() ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomView;
