import { Notification } from "../types";
import { request } from "./client";

export const getNotifications = async (
  limit: number = 20,
  offset: number = 0,
): Promise<{
  items: Notification[];
  total: number;
  unread_count: number;
}> => {
  return await request<{
    items: Notification[];
    total: number;
    unread_count: number;
  }>(`/notification?limit=${limit}&offset=${offset}`);
};

export const markAllAsRead = async (): Promise<{ success: boolean }> => {
  return await request<{ success: boolean }>("/notification/read-all", {
    method: "PATCH",
    body: JSON.stringify({}),
  });
};

export const markAsRead = async (
  id: string,
): Promise<{ success: boolean }> => {
  return await request<{ success: boolean }>(`/notification/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
};

export const deleteNotification = async (id: string): Promise<void> => {
  await request<void>(`/notification/${id}`, {
    method: "DELETE",
  });
};
