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
      className="flex h-6 w-full shrink-0 items-center justify-between border-b px-[var(--sys-space-3)]"
      style={{
        backgroundColor: "var(--sys-titlebar)",
        borderColor: "var(--sys-border)",
      }}
    >
      <div className="flex items-center gap-0">
        <button
          type="button"
          className="shrink-0 border-0 bg-transparent px-[var(--sys-space-2)] py-0 text-[1rem]"
          style={{ color: "var(--sys-fg)", cursor: "default" }}
          title="Apple"
          aria-label="Apple"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M10.5 7.7c-.1-1.2.4-2.2 1.2-2.9.7-.6 1.6-1 2.4-.9.1 1.2-.5 2.3-1.2 3-.8.7-1.7 1-2.5.9zm.4 1.2c1.3-.1 2.3-.8 2.9-1.6-1.4-.6-2.4-.2-3.1.5-.7.7-1 1.7-.9 2.8.5 0 1.1-.1 1.7-.4.2-.1.4-.2.4-.3zM7 1C4.2 1 2 3.2 2 6c0 3.2 2.5 6 5 6s5-2.8 5-6c0-2.8-2.2-5-5-5zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5S5.6 4.5 7 4.5s2.5 1.1 2.5 2.5S8.4 9.5 7 9.5z" />
          </svg>
        </button>
        <span
          className="ml-[var(--sys-space-2)] mr-[var(--sys-space-3)] text-[1rem] font-semibold"
          style={{ color: "var(--sys-fg)" }}
        >
          GeoData
        </span>
        <span
          className="border-0 bg-transparent px-[var(--sys-space-2)] py-0 text-[1rem]"
          style={{ color: "var(--sys-fg)", cursor: "default" }}
        >
          Canvas
        </span>
        <span
          className="border-0 bg-transparent px-[var(--sys-space-2)] py-0 text-[1rem]"
          style={{ color: "var(--sys-fg)", cursor: "default" }}
        >
          Scenes
        </span>
        <span
          className="border-0 bg-transparent px-[var(--sys-space-2)] py-0 text-[1rem]"
          style={{ color: "var(--sys-fg)", cursor: "default" }}
        >
          Data
        </span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="shrink-0 border border-transparent bg-transparent px-[var(--sys-space-2)] py-0 text-[1rem] hover:border-[var(--sys-border)]"
        style={{ color: "var(--sys-fg)", cursor: "pointer" }}
        title="Sign out"
      >
        Sign out
      </button>
    </header>
  );
}
