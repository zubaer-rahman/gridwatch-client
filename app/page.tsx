import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono text-amber-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM OPERATIONAL
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          GridWatch Operations
        </h1>
        <p className="text-sm text-muted-foreground">
          Intelligent outage management and electrical grid telemetry for
          Bangladesh.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Access Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
