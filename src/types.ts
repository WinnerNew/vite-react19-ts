export interface User {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  location?: string;
  website?: string;
  is_following?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  author: User;
  content: string;
  timestamp: string;
  full_timestamp?: string;
  likes_count: number;
  reposts_count: number;
  replies_count: number;
  image?: string;
  is_liked?: boolean;
  is_reposted?: boolean;
  parent_id?: string;
  parent_post?: Post;
  created_at?: string;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: User;
  is_mine?: boolean;
}

export interface Chat {
  id: string;
  user: User;
  last_message?: {
    content: string;
    created_at: string;
  };
  updated_at?: string;
}

export interface Notification {
  id: string;
  type: "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MESSAGE";
  post?: Post;
  message?: {
    id: string;
    content: string;
    sender: User;
  };
  actor: User;
  read: boolean;
  created_at: string;
  is_following?: boolean;
}

export type ViewState =
  | "HOME"
  | "EXPLORE"
  | "NOTIFICATIONS"
  | "MESSAGES"
  | "PROFILE"
  | "CHAT"
  | "AUTH"
  | "SETTINGS"
  | "SYSTEM_SETTINGS"
  | "CREATE_POST"
  | "EDIT_PROFILE";
