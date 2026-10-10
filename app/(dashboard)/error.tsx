"use client";

import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-card p-6 sm:p-8 shadow-lg space-y-5">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Module Telemetry Interruption
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A communication failure occurred while rendering this operational
            panel.
          </p>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-left text-xs font-mono text-muted-foreground border border-border/80">
          <div className="text-destructive font-semibold">MODULE_FAULT:</div>
          <div className="break-words text-foreground mt-0.5">
            {error.message || "Unknown error encountered in dashboard view."}
          </div>
          {error.digest && (
            <div className="text-[10px] text-muted-foreground/80 mt-1">
              DIGEST: {error.digest}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1 justify-center">
          <Button
            onClick={() => reset()}
            size="sm"
            className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Panel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload View</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
