import { useEffect, useState, type ReactNode } from "react";
import AuthPage from "./components/AuthPage";
import Onboarding from "./components/Onboarding";
import StoreScene from "./components/StoreScene";
import { api, ApiError } from "./lib/api";
import { DEFAULT_AVATAR, type Avatar, type User } from "./types";

type Screen =
  | { name: "loading" }
  | { name: "auth" }
  | { name: "onboarding"; user: User; avatar: Avatar }
  | { name: "store"; user: User; avatar: Avatar }
  | { name: "error"; message: string };

async function loadAvatar(): Promise<Avatar | null> {
  try {
    return await api.getAvatar();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function screenFor(user: User): Promise<Screen> {
  const avatar = await loadAvatar();
  return user.onboarded && avatar
    ? { name: "store", user, avatar }
    : { name: "onboarding", user, avatar: avatar ?? DEFAULT_AVATAR };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "loading" });

  const showError = (err: unknown) =>
    setScreen({ name: "error", message: err instanceof Error ? err.message : "Could not reach the server." });

  useEffect(() => {
    api
      .me()
      .then(screenFor)
      .then(setScreen)
      .catch((err) => (err instanceof ApiError && err.status === 401 ? setScreen({ name: "auth" }) : showError(err)));
  }, []);

  async function logout() {
    await api.logout().catch(() => undefined);
    setScreen({ name: "auth" });
  }

  switch (screen.name) {
    case "loading":
      return <FullScreenMessage>Loading…</FullScreenMessage>;
    case "error":
      return <FullScreenMessage>⚠️ {screen.message}</FullScreenMessage>;
    case "auth":
      return <AuthPage onAuthenticated={(user) => screenFor(user).then(setScreen).catch(showError)} />;
    case "onboarding":
      return (
        <Onboarding
          username={screen.user.username}
          initialAvatar={screen.avatar}
          onSaved={(avatar) => setScreen({ name: "store", user: { ...screen.user, onboarded: true }, avatar })}
        />
      );
    case "store":
      return (
        <main className="relative h-screen w-screen">
          <StoreScene avatar={screen.avatar} />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2 shadow">
            <span className="font-semibold text-zinc-900">🛒 {screen.user.username}</span>
            <button
              onClick={() => setScreen({ ...screen, name: "onboarding" })}
              className="rounded-lg px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-50"
            >
              Edit avatar
            </button>
            <button onClick={logout} className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100">
              Log out
            </button>
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
            W/S or ↑/↓ to push · A/D or ←/→ to turn
          </p>
        </main>
      );
  }
}

function FullScreenMessage({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center text-zinc-600">{children}</main>;
}
