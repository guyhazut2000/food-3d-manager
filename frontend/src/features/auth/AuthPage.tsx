import { useState, type FormEvent } from "react";
import { describeError } from "../../shared/api/client";
import Button from "../../shared/ui/Button";
import ErrorMessage from "../../shared/ui/ErrorMessage";
import TextField from "../../shared/ui/TextField";
import { authApi } from "./authApi";
import type { User } from "./types";

type Mode = "login" | "register";

const MODES = {
  login: {
    subtitle: "Welcome back, shopper",
    submitLabel: "Log in",
    passwordAutoComplete: "current-password",
    passwordHint: undefined,
    switchPrompt: "New here?",
    switchLabel: "Create an account",
    switchTo: "register",
  },
  register: {
    subtitle: "Create your shopper account",
    submitLabel: "Create account",
    passwordAutoComplete: "new-password",
    passwordHint: "At least 8 characters",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchTo: "login",
  },
} as const satisfies Record<Mode, { switchTo: Mode } & Record<string, string | undefined>>;

export default function AuthPage({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = MODES[mode];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const submit = mode === "register" ? authApi.register : authApi.login;
      onAuthenticated(await submit({ username, password }));
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode(copy.switchTo);
    setError(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">🛒 food-3d-manager</h1>
          <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
        </div>

        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          pattern="[A-Za-z0-9_]{3,20}"
          title="3–20 letters, numbers, or underscores"
          required
        />
        <TextField
          label="Password"
          type="password"
          hint={copy.passwordHint}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={copy.passwordAutoComplete}
          minLength={8}
          maxLength={128}
          required
        />

        <ErrorMessage message={error} />

        <Button type="submit" disabled={submitting} className="py-2">
          {submitting ? "Please wait…" : copy.submitLabel}
        </Button>

        <p className="text-center text-sm text-zinc-600">
          {copy.switchPrompt}{" "}
          <button type="button" onClick={switchMode} className="font-semibold text-emerald-700 hover:underline">
            {copy.switchLabel}
          </button>
        </p>
      </form>
    </main>
  );
}
