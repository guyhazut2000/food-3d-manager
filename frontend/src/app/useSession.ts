import { useEffect, useState } from "react";
import { authApi } from "../features/auth/authApi";
import type { User } from "../features/auth/types";
import { avatarApi } from "../features/avatar/avatarApi";
import { DEFAULT_AVATAR, type Avatar } from "../features/avatar/types";
import { describeError, isApiError } from "../shared/api/client";

export type Screen =
  | { name: "loading" }
  | { name: "auth" }
  | { name: "onboarding"; user: User; avatar: Avatar }
  | { name: "store"; user: User; avatar: Avatar }
  | { name: "error"; message: string };

async function screenFor(user: User): Promise<Screen> {
  const avatar = await avatarApi.get();
  return user.onboarded && avatar
    ? { name: "store", user, avatar }
    : { name: "onboarding", user, avatar: avatar ?? DEFAULT_AVATAR };
}

/** Owns the logged-in user and decides which screen to show. */
export default function useSession() {
  const [screen, setScreen] = useState<Screen>({ name: "loading" });

  const showError = (err: unknown) =>
    setScreen({ name: "error", message: describeError(err, "Could not reach the server.") });

  useEffect(() => {
    authApi
      .me()
      .then(screenFor)
      .then(setScreen)
      .catch((err) => (isApiError(err, 401) ? setScreen({ name: "auth" }) : showError(err)));
  }, []);

  return {
    screen,
    onAuthenticated: (user: User) => screenFor(user).then(setScreen).catch(showError),
    onAvatarSaved: (user: User, avatar: Avatar) =>
      setScreen({ name: "store", user: { ...user, onboarded: true }, avatar }),
    editAvatar: (user: User, avatar: Avatar) => setScreen({ name: "onboarding", user, avatar }),
    logout: async () => {
      await authApi.logout().catch(() => undefined);
      setScreen({ name: "auth" });
    },
  };
}
