import { API_URL } from "./config";
import type { Avatar, User } from "../types";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

async function errorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (typeof data?.detail === "string") return data.detail;
  if (response.status === 422) return "Please check the form fields and try again.";
  return "Something went wrong. Please try again.";
}

export type Credentials = { username: string; password: string };

export const api = {
  me: () => request<User>("GET", "/auth/me"),
  register: (credentials: Credentials) => request<User>("POST", "/auth/register", credentials),
  login: (credentials: Credentials) => request<User>("POST", "/auth/login", credentials),
  logout: () => request<void>("POST", "/auth/logout"),
  getAvatar: () => request<Avatar>("GET", "/avatar"),
  saveAvatar: (avatar: Avatar) => request<Avatar>("PUT", "/avatar", avatar),
};
