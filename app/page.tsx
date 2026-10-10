import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          GridWatch Operations
        </h1>
        <p className="text-muted-foreground text-sm">
          Intelligent outage management and electrical grid telemetry for
          Bangladesh.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="rounded-md bg-amber-500 px-4 py-2 font-medium text-black transition hover:bg-amber-400"
          >
            Access Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
