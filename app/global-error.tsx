"use client";

import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <main className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mx-auto shadow-2xl">
            <AlertOctagon className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Critical System Crash
            </h1>
            <p className="text-sm text-neutral-400">
              The root application infrastructure encountered an unrecoverable
              failure.
            </p>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-left text-xs font-mono text-neutral-400 space-y-1">
            <div className="text-red-400 font-semibold">
              ROOT_LAYOUT_EXCEPTION:
            </div>
            <div className="break-all text-neutral-300">
              {error.message || "Unknown root layout fault"}
            </div>
            {error.digest && (
              <div className="text-[11px] text-neutral-500">
                DIGEST: {error.digest}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restart Application</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm transition"
            >
              <span>Back to Portal</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
