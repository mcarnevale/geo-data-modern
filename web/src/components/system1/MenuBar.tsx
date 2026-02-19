"use client";

import { useRouter } from "next/navigation";

export interface MenuBarProps {
  onOpenScenesSelect?: () => void;
  onSaveScene?: (name: string) => void;
  onCloseScene?: () => void;
  onSaveTileSet?: (name: string) => void;
}

export function MenuBar(_props: MenuBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="flex h-11 w-full shrink-0 items-center justify-between border-b px-4"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-6">
        <span
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          GeoData
        </span>
        <nav className="flex items-center gap-1">
          {["Canvas", "Scenes", "Data"].map((label) => (
            <span
              key={label}
              className="rounded px-2.5 py-1 text-[13px]"
              style={{ color: "var(--fg-muted)", cursor: "default" }}
            >
              {label}
            </span>
          ))}
        </nav>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded px-3 py-1.5 text-[13px] transition-colors"
        style={{
          color: "var(--fg-muted)",
          cursor: "pointer",
          background: "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-muted)";
        }}
        title="Sign out"
      >
        Sign out
      </button>
    </header>
  );
}
