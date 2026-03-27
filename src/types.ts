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
  isFollowing?: boolean;
  createdAt?: string;
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  timestamp: string;
  fullTimestamp?: string;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  image?: string;
  isLiked?: boolean;
  isReposted?: boolean;
  parentId?: string;
  parentPost?: Post;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: User;
}

export interface Chat {
  id: string;
  participant: User;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: "LIKE" | "REPOST" | "REPLY" | "FOLLOW";
  postId?: string;
  actorId: string;
  recipientId: string;
  isRead: boolean;
  time: string;
  actor: User;
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
