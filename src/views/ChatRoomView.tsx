
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Info, Image, Gift, Smile, Send } from 'lucide-react';
import { Message } from '../types';

interface ChatRoomViewProps {
  chatId: string;
  onBack: () => void;
}

const ChatRoomView: React.FC<ChatRoomViewProps> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'other', text: 'Hey there! How is the project going?', timestamp: '10:30 AM' },
    { id: '2', senderId: 'me', text: 'It is going great! Almost finished the mobile app UI.', timestamp: '10:32 AM' },
    { id: '3', senderId: 'other', text: 'Awesome, can’t wait to see it! 😍', timestamp: '10:33 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
            <div className="flex flex-col">
              <h2 className="text-[15px] font-bold leading-tight">Tech Insider</h2>
              <p className="text-[12px] text-zinc-500 leading-tight">@tech_news</p>
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><Info size={20} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-[15px] leading-relaxed break-words ${
              msg.senderId === 'me' 
                ? 'bg-sky-500 text-white rounded-br-sm' 
                : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 pb-[calc(16px+env(safe-area-inset-bottom,0px))] bg-black">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sky-500">
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors"><Image size={20} /></button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors invisible xs:visible"><Gift size={20} /></button>
          </div>
          <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4 transition-all focus-within:ring-1 focus-within:ring-sky-500">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Start a new message" 
              className="bg-transparent border-none text-zinc-100 text-[14px] py-2.5 outline-none w-full" 
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`${inputText.trim() ? 'text-sky-500' : 'text-zinc-700'} transition-colors ml-2`}
            >
              <Send size={18} fill={inputText.trim() ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomView;
