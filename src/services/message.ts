import { Message, Chat } from "../types";
import { request } from "./client";

export const getChats = async (): Promise<Chat[]> => {
  const data = await request<{ items: Chat[]; total: number }>(
    "/message/chats",
  );
  return data.items;
};

export const getMessages = async (
  chatId: string,
  limit: number = 50,
  before?: string,
): Promise<Message[]> => {
  let url = `/message/chats/${chatId}/messages?limit=${limit}`;
  if (before) {
    url += `&before=${encodeURIComponent(before)}`;
  }
  const data = await request<{ items: Message[]; total: number }>(url);
  return data.items;
};

export const sendMessage = async (
  chatId: string,
  content: string,
): Promise<Message> => {
  return await request<Message>(`/message/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

export const createChat = async (
  recipient_id: string,
): Promise<{ id: string }> => {
  return await request<{ id: string }>("/message/chats", {
    method: "POST",
    body: JSON.stringify({ recipient_id }),
  });
};
