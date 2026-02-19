import type { ReactNode } from "react";

export interface WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Window({ title, children, className, contentClassName }: WindowProps) {
  return (
    <section
      aria-label={title}
      className={`inline-flex min-w-0 flex-col overflow-hidden ${className ?? ""}`}
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <header
        className="flex shrink-0 items-center border-b px-3"
        style={{
          height: "36px",
          borderColor: "var(--border-subtle)",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          {title}
        </span>
      </header>
      <main className={`min-h-0 flex-1 border-0 p-3 ${contentClassName ?? ""}`}>
        {children}
      </main>
    </section>
  );
}
