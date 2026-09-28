import type { ReactNode } from "react";
import AuthPage from "../features/auth/AuthPage";
import Onboarding from "../features/avatar/Onboarding";
import StoreScreen from "../features/store/StoreScreen";
import useSession from "./useSession";

export default function App() {
  const { screen, onAuthenticated, onAvatarSaved, editAvatar, logout } = useSession();

  switch (screen.name) {
    case "loading":
      return <FullScreenMessage>Loading…</FullScreenMessage>;
    case "error":
      return <FullScreenMessage>⚠️ {screen.message}</FullScreenMessage>;
    case "auth":
      return <AuthPage onAuthenticated={onAuthenticated} />;
    case "onboarding":
      return (
        <Onboarding
          username={screen.user.username}
          initialAvatar={screen.avatar}
          onSaved={(avatar) => onAvatarSaved(screen.user, avatar)}
        />
      );
    case "store":
      return (
        <StoreScreen
          user={screen.user}
          avatar={screen.avatar}
          onEditAvatar={() => editAvatar(screen.user, screen.avatar)}
          onLogout={logout}
        />
      );
  }
}

function FullScreenMessage({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center text-zinc-600">{children}</main>;
}
