import { Post } from "../types";
import { request } from "./client";

export const createPost = async (
  content: string,
  image?: string,
  parent_id?: string,
): Promise<Post> => {
  return await request<Post>("/post", {
    method: "POST",
    body: JSON.stringify({ content, image, parent_id }),
  });
};

export const getPosts = async (
  limit: number = 20,
  offset: number = 0,
  type: string = "FOR_YOU",
): Promise<{ items: Post[]; total: number }> => {
  return await request<{ items: Post[]; total: number }>(
    `/post?limit=${limit}&offset=${offset}&type=${type}`,
  );
};

export const searchPosts = async (q: string): Promise<Post[]> => {
  const data = await request<{ items: Post[]; total: number }>(
    `/post/search?q=${encodeURIComponent(q)}`,
  );
  return data.items;
};

export const likePost = async (id: string): Promise<{ liked: boolean }> => {
  return await request<{ liked: boolean }>(`/post/${id}/likes`, {
    method: "POST",
    body: JSON.stringify({}),
  });
};

export const unlikePost = async (id: string): Promise<void> => {
  await request<void>(`/post/${id}/likes`, {
    method: "DELETE",
  });
};

export const repostPost = async (
  id: string,
): Promise<{ reposted: boolean }> => {
  return await request<{ reposted: boolean }>(`/post/${id}/reposts`, {
    method: "POST",
    body: JSON.stringify({}),
  });
};

export const unrepostPost = async (id: string): Promise<void> => {
  await request<void>(`/post/${id}/reposts`, {
    method: "DELETE",
  });
};

export const getPost = async (id: string): Promise<Post> => {
  return await request<Post>(`/post/${id}`);
};

export const getReplies = async (id: string): Promise<Post[]> => {
  const data = await request<{ items: Post[]; total: number }>(
    `/post/${id}/replies`,
  );
  return data.items;
};

export const deletePost = async (id: string): Promise<void> => {
  await request<void>(`/post/${id}`, {
    method: "DELETE",
  });
};
