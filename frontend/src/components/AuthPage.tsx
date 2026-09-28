import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

type Mode = "login" | "register";

export default function AuthPage({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const submit = isRegister ? api.register : api.login;
      onAuthenticated(await submit({ username, password }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">🛒 food-3d-manager</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isRegister ? "Create your shopper account" : "Welcome back, shopper"}
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Username</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            pattern="[A-Za-z0-9_]{3,20}"
            title="3–20 letters, numbers, or underscores"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={8}
            maxLength={128}
            required
          />
          {isRegister && <span className="mt-1 block text-xs text-zinc-500">At least 8 characters</span>}
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>

        <p className="text-center text-sm text-zinc-600">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button type="button" onClick={switchMode} className="font-semibold text-emerald-700 hover:underline">
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>
      </form>
    </main>
  );
}
