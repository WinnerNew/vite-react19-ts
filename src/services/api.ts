import { User, Post, Message, Chat, Notification } from "../types";

const API_BASE_URL = "http://localhost:3001/api";

// 存储token
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

const removeToken = (): void => {
  localStorage.removeItem("token");
};

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.msg || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

// 认证相关API
export const authApi = {
  // 注册
  register: async (
    username: string,
    handle: string,
    password: string,
    avatar: string,
  ) => {
    const response = await request<{ user: User; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ username, handle, password, avatar }),
      },
    );
    setToken(response.token);
    return response.user;
  },

  // 登录
  login: async (handle: string, password: string) => {
    const response = await request<{ user: User; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ handle, password }),
      },
    );
    setToken(response.token);
    return response.user;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await request<{ user: User }>("/auth/me");
    return response.user;
  },

  // 登出
  logout: () => {
    removeToken();
  },
};

// 用户相关API
export const userApi = {
  // 获取用户资料
  getUser: async (id: string) => {
    const response = await request<{ user: User }>(`/user/${id}`);
    return response.user;
  },

  // 获取用户资料
  getProfile: async (id: string) => {
    const response = await request<{ user: User }>(`/user/${id}`);
    return response.user;
  },

  // 搜索用户
  searchUsers: async (q: string) => {
    const response = await request<{ users: User[] }>(
      `/user/search?q=${encodeURIComponent(q)}`,
    );
    return response.users;
  },

  // 获取推荐关注
  getSuggestions: async () => {
    const response = await request<{ users: User[] }>("/user/suggestions");
    return response.users;
  },

  // 关注/取消关注
  followUser: async (id: string) => {
    const response = await request<{ followed: boolean }>(
      `/user/${id}/follow`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    return response;
  },

  // 更新用户资料
  updateProfile: async (
    bio: string,
    location: string,
    website: string,
    avatar: string,
  ) => {
    const response = await request<{ user: User }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ bio, location, website, avatar }),
    });
    return response.user;
  },

  // 获取用户的帖子
  getUserPosts: async (id: string) => {
    const response = await request<{ posts: Post[] }>(`/user/${id}/posts`);
    return response.posts;
  },
};

// 帖子相关API
export const postApi = {
  // 创建帖子或回复
  createPost: async (content: string, image?: string, parentId?: string) => {
    const response = await request<Post>("/post", {
      method: "POST",
      body: JSON.stringify({ content, image, parentId }),
    });
    return response;
  },

  // 获取帖子列表
  getPosts: async (
    limit: number = 10,
    offset: number = 0,
    type: string = "FOR_YOU",
  ) => {
    const response = await request<{ posts: Post[]; total: number }>(
      `/post?limit=${limit}&offset=${offset}&type=${type}`,
    );
    return response;
  },

  // 搜索帖子
  searchPosts: async (q: string) => {
    const response = await request<{ posts: Post[] }>(
      `/post/search?q=${encodeURIComponent(q)}`,
    );
    return response.posts;
  },

  // 点赞/取消点赞
  likePost: async (id: string) => {
    const response = await request<{ liked: boolean }>(`/post/${id}/like`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return response;
  },

  // 转发/取消转发
  repostPost: async (id: string) => {
    const response = await request<{ reposted: boolean }>(
      `/post/${id}/repost`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    return response;
  },

  // 获取单个帖子
  getPost: async (id: string) => {
    const response = await request<Post>(`/post/${id}`);
    return response;
  },

  // 获取回复列表
  getReplies: async (id: string) => {
    const response = await request<Post[]>(`/post/${id}/replies`);
    return response;
  },
};

// 消息相关API
export const messageApi = {
  // 获取聊天列表
  getChats: async () => {
    const response = await request<{ chats: Chat[] }>("/message/chats");
    return response.chats;
  },

  // 获取聊天消息
  getMessages: async (chatId: string) => {
    const response = await request<{ messages: Message[] }>(
      `/message/chats/${chatId}/messages`,
    );
    return response.messages;
  },

  // 发送消息
  sendMessage: async (chatId: string, text: string) => {
    const response = await request<{ message: Message }>(
      `/message/chats/${chatId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ text }),
      },
    );
    return response.message;
  },

  // 创建新聊天
  createChat: async (participantId: string) => {
    const response = await request<{ chat: Chat }>("/message/chats", {
      method: "POST",
      body: JSON.stringify({ participantId }),
    });
    return response.chat;
  },
};

// 通知相关API
export const notificationApi = {
  // 获取通知列表
  getNotifications: async () => {
    const response = await request<Notification[]>("/notification");
    return response;
  },

  // 标记所有通知为已读
  markAllAsRead: async () => {
    const response = await request<{ success: boolean }>(
      "/notification/read-all",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    return response;
  },
};
