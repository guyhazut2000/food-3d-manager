import { request } from "../../shared/api/client";
import type { User } from "./types";

export type Credentials = { username: string; password: string };

export const authApi = {
  me: () => request<User>("GET", "/auth/me"),
  register: (credentials: Credentials) => request<User>("POST", "/auth/register", credentials),
  login: (credentials: Credentials) => request<User>("POST", "/auth/login", credentials),
  logout: () => request<void>("POST", "/auth/logout"),
};
