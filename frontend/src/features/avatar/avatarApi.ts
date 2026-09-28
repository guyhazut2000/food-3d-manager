import { isApiError, request } from "../../shared/api/client";
import type { Avatar } from "./types";

export const avatarApi = {
  /** Returns null when the user hasn't created an avatar yet. */
  get: async (): Promise<Avatar | null> => {
    try {
      return await request<Avatar>("GET", "/avatar");
    } catch (err) {
      if (isApiError(err, 404)) return null;
      throw err;
    }
  },
  save: (avatar: Avatar) => request<Avatar>("PUT", "/avatar", avatar),
};
