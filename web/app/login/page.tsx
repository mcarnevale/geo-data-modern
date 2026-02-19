"use client";

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
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: (data.error as string) ?? "Login failed" });
        return;
      }
      router.push(from);
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--fg)",
    padding: "8px 12px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
            GeoData
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--fg-muted)" }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
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
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              required
            />
          </label>

          {message && (
            <p className="text-[13px]" style={{ color: "#f87171" }} role="alert">
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded py-2.5 text-[14px] font-semibold transition-opacity"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              borderRadius: "var(--radius)",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen flex-col items-center justify-center"
          style={{ background: "var(--bg)" }}
        >
          <p className="text-[13px]" style={{ color: "var(--fg-muted)" }}>
            Loading…
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
