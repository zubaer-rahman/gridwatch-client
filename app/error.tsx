"use client";

import { Home, RefreshCw, RotateCcw, ZapOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div
      suppressHydrationWarning
      className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-background overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(239,68,68,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-destructive/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />

      <main className="relative z-10 w-full max-w-lg text-center space-y-6">
        {/* Disrupted Transmission Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-destructive/30 bg-card p-4 shadow-2xl">
            <ZapOff className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-mono font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping" />
            TELEMETRY FAULT OCCURRED
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            System Transmission Anomaly
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            An unexpected interruption occurred while processing the telemetry
            pipeline. Operational circuits remain guarded.
          </p>
        </div>

        {/* Diagnostics & Error Box */}
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xs p-4 text-left text-xs font-mono space-y-2 text-muted-foreground shadow-xs">
          <div className="flex items-center justify-between text-foreground font-semibold">
            <span>CIRCUIT_INTERRUPT_SUMMARY</span>
            <span className="text-destructive">ERR_CIRCUIT_BREAKER</span>
          </div>
          <div className="border-t border-border/60 pt-2 space-y-1">
            <p className="text-destructive/90 break-words font-medium">
              {error.message ||
                "An unhandled runtime exception halted the active render process."}
            </p>
            {error.digest && (
              <p className="text-[11px] text-muted-foreground pt-1">
                ERROR_DIGEST:{" "}
                <span className="text-foreground">{error.digest}</span>
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-[11px] text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>
                {showTechnicalDetails
                  ? "Hide technical stack"
                  : "View diagnostic details"}
              </span>
            </button>
            {showTechnicalDetails && error.stack && (
              <pre className="mt-2 p-2 rounded bg-black/40 border border-border text-[10px] text-muted-foreground overflow-x-auto max-h-36">
                {error.stack}
              </pre>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Circuits</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Hard Refresh</span>
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full sm:w-auto gap-2",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Operations Portal</span>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 mt-12 text-center text-xs text-muted-foreground">
        © 2026 GridWatch Bangladesh. Outage Management & Emergency Protocol.
      </footer>
    </div>
  );
}
