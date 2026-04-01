import { User, Post } from "../types";
import { request } from "./client";

export const getUser = async (id: string): Promise<User> => {
  return await request<User>(`/user/${id}`);
};

export const getProfile = async (id: string): Promise<User> => {
  return await request<User>(`/user/${id}`);
};

export const searchUsers = async (q: string): Promise<User[]> => {
  const data = await request<{ items: User[]; total: number }>(
    `/user?search=${encodeURIComponent(q)}`,
  );
  return data.items;
};

export const getSuggestions = async (): Promise<User[]> => {
  const data = await request<{ items: User[]; total: number }>(
    "/user/suggestions",
  );
  return data.items;
};

export const followUser = async (
  id: string,
): Promise<{ followed: boolean }> => {
  return await request<{ followed: boolean }>(`/user/${id}/follow`, {
    method: "POST",
    body: JSON.stringify({}),
  });
};

export const updateProfile = async (
  username: string,
  bio: string,
  location: string,
  website: string,
  avatar: string,
): Promise<User> => {
  return await request<User>("/user/profile", {
    method: "PUT",
    body: JSON.stringify({ username, bio, location, website, avatar }),
  });
};

export const getUserPosts = async (id: string): Promise<Post[]> => {
  const data = await request<{ items: Post[]; total: number }>(
    `/user/${id}/posts`,
  );
  return data.items;
};

export const getFollowers = async (id: string): Promise<User[]> => {
  const data = await request<{ items: User[]; total: number }>(
    `/user/${id}/followers`,
  );
  return data.items;
};

export const getFollowing = async (id: string): Promise<User[]> => {
  const data = await request<{ items: User[]; total: number }>(
    `/user/${id}/following`,
  );
  return data.items;
};
