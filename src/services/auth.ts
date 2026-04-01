import { User } from "../types";
import { request, setToken, removeToken } from "./client";

export const register = async (
  username: string,
  handle: string,
  password: string,
  avatar: string,
): Promise<User> => {
  const data = await request<{ user: User; token: string }>("/auth/users", {
    method: "POST",
    body: JSON.stringify({ username, handle, password, avatar }),
  });
  setToken(data.token);
  return data.user;
};

export const login = async (handle: string, password: string): Promise<User> => {
  const data = await request<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ handle, password }),
  });
  setToken(data.token);
  return data.user;
};

export const getCurrentUser = async (): Promise<User> => {
  const data = await request<{ user: User }>("/auth/me");
  return data.user;
};

export const logout = (): void => {
  removeToken();
};
