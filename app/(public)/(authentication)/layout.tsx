import { Zap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      suppressHydrationWarning
      className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10"
    >
      {/* Background radial gradient & grid glow */}
      <div
        suppressHydrationWarning
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(0,0,0,0))]"
      />

      <header
        suppressHydrationWarning
        className="absolute top-6 left-6 right-6 flex items-center justify-between"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight transition hover:opacity-80"
        >
          <div
            suppressHydrationWarning
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-black shadow-sm"
          >
            <Zap className="h-4 w-4 fill-black" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            GridWatch<span className="text-amber-500">.bd</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main suppressHydrationWarning className="relative z-10 w-full max-w-md">
        <div
          suppressHydrationWarning
          className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8 backdrop-blur-xs"
        >
          {children}
        </div>
      </main>

      <footer
        suppressHydrationWarning
        className="relative z-10 mt-8 text-center text-xs text-muted-foreground"
      >
        © 2026 GridWatch Bangladesh. Outage Management & Operations.
      </footer>
    </div>
  );
}
