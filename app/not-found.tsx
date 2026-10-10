"use client";

import { ArrowLeft, Home, RadioOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      suppressHydrationWarning
      className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-background overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(245,158,11,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <main className="relative z-10 w-full max-w-lg text-center space-y-6">
        {/* Radar / Desync Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-500/30 bg-card p-4 shadow-2xl">
            <RadioOff className="h-12 w-12 text-amber-500" />
          </div>
        </div>

        {/* Technical Status Code */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-mono font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            404 TELEMETRY DESYNC
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Grid Sector Not Located
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            The requested transmission coordinate, substation feeder, or
            management node does not exist on the GridWatch network.
          </p>
        </div>

        {/* Diagnostics Box */}
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xs p-4 text-left text-xs font-mono space-y-1.5 text-muted-foreground shadow-xs">
          <div className="flex items-center justify-between text-foreground font-semibold">
            <span>GRID_NODE_DIAGNOSTICS</span>
            <span className="text-destructive font-mono">
              STATUS: UNREACHABLE
            </span>
          </div>
          <div className="border-t border-border/60 pt-2 space-y-1">
            <p className="flex justify-between">
              <span>RESOLUTION_STATUS:</span>
              <span className="text-amber-500">HTTP_404_NOT_FOUND</span>
            </p>
            <p className="flex justify-between">
              <span>NETWORK_DISPATCH:</span>
              <span>BANGLADESH_DISTRIBUTION_GRID</span>
            </p>
            <p className="flex justify-between">
              <span>SYSTEM_ACTION:</span>
              <span>VERIFY_ROUTING_COORDINATES</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Station</span>
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Operations Portal</span>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 mt-12 text-center text-xs text-muted-foreground">
        © 2026 GridWatch Bangladesh. Intelligent Power Distribution Network.
      </footer>
    </div>
  );
}
