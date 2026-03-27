import { User, Post, Message, Chat } from "../types";

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

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

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
  // 创建帖子
  createPost: async (content: string, image?: string) => {
    const response = await request<{ post: Post }>("/post", {
      method: "POST",
      body: JSON.stringify({ content, image }),
    });
    return response.post;
  },

  // 获取帖子列表
  getPosts: async (limit: number = 10, offset: number = 0) => {
    const response = await request<{ posts: Post[]; total: number }>(
      `/post?limit=${limit}&offset=${offset}`,
    );
    return response;
  },

  // 获取单个帖子
  getPost: async (id: string) => {
    const response = await request<{ post: Post }>(`/post/${id}`);
    return response.post;
  },

  // 更新帖子
  updatePost: async (id: string, content: string, image?: string) => {
    const response = await request<{ post: Post }>(`/post/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content, image }),
    });
    return response.post;
  },

  // 删除帖子
  deletePost: async (id: string) => {
    const response = await request<{ message: string }>(`/post/${id}`, {
      method: "DELETE",
    });
    return response.message;
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
