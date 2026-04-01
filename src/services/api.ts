import { User, Post, Message, Chat, Notification } from "../types";

const API_BASE_URL = "http://localhost:3001/api";

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

const removeToken = (): void => {
  localStorage.removeItem("token");
};

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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  if (data.code !== 20000) {
    throw new Error(data.message || "Request failed");
  }

  return data.data;
}

export const authApi = {
  register: async (
    username: string,
    handle: string,
    password: string,
    avatar: string,
  ) => {
    const data = await request<{ user: User; token: string }>("/auth/users", {
      method: "POST",
      body: JSON.stringify({ username, handle, password, avatar }),
    });
    setToken(data.token);
    return data.user;
  },

  login: async (handle: string, password: string) => {
    const data = await request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ handle, password }),
    });
    setToken(data.token);
    return data.user;
  },

  getCurrentUser: async () => {
    const data = await request<{ user: User }>("/auth/users/me");
    return data.user;
  },

  logout: () => {
    removeToken();
  },
};

export const userApi = {
  getUser: async (id: string) => {
    const data = await request<User>(`/user/${id}`);
    return data;
  },

  getProfile: async (id: string) => {
    const data = await request<User>(`/user/${id}`);
    return data;
  },

  searchUsers: async (q: string) => {
    const data = await request<{ items: User[]; total: number }>(
      `/user?search=${encodeURIComponent(q)}`,
    );
    return data.items;
  },

  getSuggestions: async () => {
    const data = await request<{ items: User[]; total: number }>(
      "/user/suggestions",
    );
    return data.items;
  },

  followUser: async (id: string) => {
    const data = await request<{ followed: boolean }>(`/user/${id}/follow`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return data;
  },

  updateProfile: async (
    username: string,
    bio: string,
    location: string,
    website: string,
    avatar: string,
  ) => {
    const data = await request<User>("/user/me", {
      method: "PATCH",
      body: JSON.stringify({ username, bio, location, website, avatar }),
    });
    return data;
  },

  getUserPosts: async (id: string) => {
    const data = await request<{ items: Post[]; total: number }>(
      `/user/${id}/posts`,
    );
    return data.items;
  },

  getFollowers: async (id: string) => {
    const data = await request<{ items: User[]; total: number }>(
      `/user/${id}/followers`,
    );
    return data.items;
  },

  getFollowing: async (id: string) => {
    const data = await request<{ items: User[]; total: number }>(
      `/user/${id}/following`,
    );
    return data.items;
  },
};

export const postApi = {
  createPost: async (content: string, image?: string, parent_id?: string) => {
    const data = await request<Post>("/post", {
      method: "POST",
      body: JSON.stringify({ content, image, parent_id }),
    });
    return data;
  },

  getPosts: async (
    limit: number = 20,
    offset: number = 0,
    type: string = "FOR_YOU",
  ) => {
    const data = await request<{ items: Post[]; total: number }>(
      `/post?limit=${limit}&offset=${offset}&type=${type}`,
    );
    return data;
  },

  searchPosts: async (q: string) => {
    const data = await request<{ items: Post[]; total: number }>(
      `/post/search?q=${encodeURIComponent(q)}`,
    );
    return data.items;
  },

  likePost: async (id: string) => {
    const data = await request<{ liked: boolean }>(`/post/${id}/likes`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return data;
  },

  unlikePost: async (id: string) => {
    await request<void>(`/post/${id}/likes`, {
      method: "DELETE",
    });
  },

  repostPost: async (id: string) => {
    const data = await request<{ reposted: boolean }>(`/post/${id}/reposts`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return data;
  },

  unrepostPost: async (id: string) => {
    await request<void>(`/post/${id}/reposts`, {
      method: "DELETE",
    });
  },

  getPost: async (id: string) => {
    const data = await request<Post>(`/post/${id}`);
    return data;
  },

  getReplies: async (id: string) => {
    const data = await request<{ items: Post[]; total: number }>(
      `/post/${id}/replies`,
    );
    return data.items;
  },

  deletePost: async (id: string) => {
    await request<void>(`/post/${id}`, {
      method: "DELETE",
    });
  },
};

export const messageApi = {
  getChats: async () => {
    const data = await request<{ items: Chat[]; total: number }>(
      "/message/chats",
    );
    return data.items;
  },

  getMessages: async (chatId: string, limit: number = 50, before?: string) => {
    let url = `/message/chats/${chatId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }
    const data = await request<{ items: Message[]; total: number }>(url);
    return data.items;
  },

  sendMessage: async (chatId: string, content: string) => {
    const data = await request<Message>(`/message/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    return data;
  },

  createChat: async (recipient_id: string) => {
    const data = await request<{ id: string }>("/message/chats", {
      method: "POST",
      body: JSON.stringify({ recipient_id }),
    });
    return data;
  },
};

export const notificationApi = {
  getNotifications: async (limit: number = 20, offset: number = 0) => {
    const data = await request<{
      items: Notification[];
      total: number;
      unread_count: number;
    }>(`/notification?limit=${limit}&offset=${offset}`);
    return data;
  },

  markAllAsRead: async () => {
    const data = await request<{ success: boolean }>("/notification/read-all", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    return data;
  },

  markAsRead: async (id: string) => {
    const data = await request<{ success: boolean }>(
      `/notification/${id}/read`,
      {
        method: "PATCH",
        body: JSON.stringify({}),
      },
    );
    return data;
  },

  deleteNotification: async (id: string) => {
    await request<void>(`/notification/${id}`, {
      method: "DELETE",
    });
  },
};
