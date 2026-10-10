import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div
      suppressHydrationWarning
      className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(245,158,11,0.1),rgba(0,0,0,0))]" />

      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        {/* Pulsing Energy Node */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-2xl bg-amber-500/20 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-card p-3 shadow-xl">
            <Zap className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Status Copy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-mono font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            SYNCHRONIZING TELEMETRY
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Connecting to Grid Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            Calibrating substation metrics, feeder channels, and active incident
            telemetry...
          </p>
        </div>

        {/* Loading Progress Pulse Bar */}
        <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden relative">
          <div className="h-full bg-amber-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
