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
      className={`inline-flex min-w-0 flex-col overflow-hidden border bg-white ${className ?? ""}`}
      style={{
        borderColor: "var(--sys-border)",
        boxShadow: "2px 2px 0 0 var(--sys-shadow)",
      }}
    >
      {/* Title bar — System 1 proportion (~18–20px) */}
      <header
        className="relative flex shrink-0 items-center justify-center border-b px-[var(--sys-space-2)]"
        style={{
          height: "20px",
          backgroundColor: "var(--sys-titlebar)",
          borderColor: "var(--sys-border)",
        }}
      >
        <div
          className="absolute left-[var(--sys-space-2)] flex gap-[var(--sys-space-1)]"
          aria-hidden="true"
        >
          <span
            className="h-2 w-2 border bg-white"
            style={{ borderColor: "var(--sys-border)" }}
          />
          <span
            className="h-2 w-2 border bg-white"
            style={{ borderColor: "var(--sys-border)" }}
          />
          <span
            className="h-2 w-2 border bg-white"
            style={{ borderColor: "var(--sys-border)" }}
          />
        </div>
        <span className="text-center text-[1rem] font-normal" style={{ color: "var(--sys-fg)" }}>
          {title}
        </span>
      </header>
      {/* Content — tight padding from token; contentClassName can override; pin to root size */}
      <main
        className={`min-h-0 flex-1 border-0 bg-white p-[var(--sys-space-2)] text-[1rem] ${contentClassName ?? ""}`}
      >
        {children}
      </main>
    </section>
  );
}
