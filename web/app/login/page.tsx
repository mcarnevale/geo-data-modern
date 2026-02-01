"use client";

import { Window } from "@/src/components/system1/Window";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!username.trim() || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({
          type: "error",
          text: (data.error as string) ?? "Login failed",
        });
        return;
      }

      router.push(from);
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-[var(--sys-space-3)] p-[var(--sys-space-3)]"
      style={{ background: "var(--sys-bg)" }}
    >
      <h1
        className="text-[1.5rem] font-semibold"
        style={{ color: "var(--sys-fg)" }}
      >
        GeoData
      </h1>
      <Window title="LOGIN" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--sys-space-3)]">
          <label className="flex flex-col gap-[var(--sys-space-1)]">
            <span className="text-[1rem]" style={{ color: "var(--sys-fg)" }}>
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              className="border px-[var(--sys-space-2)] py-[var(--sys-space-2)] text-[1rem]"
              style={{
                borderColor: "var(--sys-border)",
                color: "var(--sys-fg)",
                background: "white",
              }}
              required
            />
          </label>
          <label className="flex flex-col gap-[var(--sys-space-1)]">
            <span className="text-[1rem]" style={{ color: "var(--sys-fg)" }}>
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className="border px-[var(--sys-space-2)] py-[var(--sys-space-2)] text-[1rem]"
              style={{
                borderColor: "var(--sys-border)",
                color: "var(--sys-fg)",
                background: "white",
              }}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full border px-[var(--sys-space-2)] py-[var(--sys-space-2)] text-[1rem]"
            style={{
              borderColor: "var(--sys-border)",
              color: "var(--sys-fg)",
              background: "var(--sys-titlebar)",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {message && (
            <p
              className="text-[1rem]"
              style={{ color: "var(--sys-fg)", opacity: 1 }}
              role="alert"
            >
              {message.text}
            </p>
          )}
        </form>
      </Window>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-[var(--sys-space-3)] p-[var(--sys-space-3)]"
        style={{ background: "var(--sys-bg)" }}
      >
        <h1 className="text-[1.5rem] font-semibold" style={{ color: "var(--sys-fg)" }}>
          GeoData
        </h1>
        <div className="w-full max-w-sm text-center" style={{ color: "var(--sys-fg)" }}>
          Loading…
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
