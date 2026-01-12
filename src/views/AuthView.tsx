
import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [handle, setHandle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: 'me',
      username: username || 'Guest User',
      handle: handle || '@guest_user',
      avatar: 'https://picsum.photos/seed/me/200',
      bio: 'Building the future of social H5.',
      followers: 1240,
      following: 890
    };
    onLogin(mockUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-10 bg-black pt-20">
      <div className="mb-12">
        <svg viewBox="0 0 24 24" className="h-14 w-14 fill-white">
          <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
        </svg>
      </div>
      
      <h1 className="text-3xl font-black mb-10 tracking-tight text-center">
        {isLogin ? "What's happening now" : "Join the conversation"}
      </h1>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-500 ml-1">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg p-3.5 text-zinc-100 outline-none transition-all placeholder:text-zinc-700"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-500 ml-1">Handle</label>
          <input
            type="text"
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full bg-transparent border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg p-3.5 text-zinc-100 outline-none transition-all placeholder:text-zinc-700"
            placeholder="@johndoe"
          />
        </div>

        <button type="submit" className="w-full bg-white text-black font-bold py-3.5 rounded-full hover:bg-zinc-200 transition-colors mt-4">
          {isLogin ? 'Log In' : 'Create account'}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-zinc-500 pb-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sky-500 font-medium hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthView;
