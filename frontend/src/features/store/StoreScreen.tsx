import type { User } from "../auth/types";
import type { Avatar } from "../avatar/types";
import StoreScene from "./StoreScene";

type Props = {
  user: User;
  avatar: Avatar;
  onEditAvatar: () => void;
  onLogout: () => void;
};

export default function StoreScreen({ user, avatar, onEditAvatar, onLogout }: Props) {
  return (
    <main className="relative h-screen w-screen">
      <StoreScene avatar={avatar} />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2 shadow">
        <span className="font-semibold text-zinc-900">🛒 {user.username}</span>
        <button onClick={onEditAvatar} className="rounded-lg px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
          Edit avatar
        </button>
        <button onClick={onLogout} className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100">
          Log out
        </button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
        W/S or ↑/↓ to push · A/D or ←/→ to turn
      </p>
    </main>
  );
}
