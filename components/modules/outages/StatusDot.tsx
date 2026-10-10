import { cn } from "@/lib/utils";
import type { OutageStatus } from "@/types";
import { getStatusLabel } from "@/utils/outage.utils";

export interface StatusDotProps {
  status: OutageStatus;
  customerPerspective?: boolean;
  className?: string;
  showPulse?: boolean;
}

export function StatusDot({
  status,
  customerPerspective = false,
  className,
  showPulse = false,
}: StatusDotProps) {
  const dotColorClasses: Record<OutageStatus, string> = {
    REPORTED: "bg-amber-500",
    ACKNOWLEDGED: "bg-blue-500",
    ASSIGNED: "bg-purple-500",
    IN_PROGRESS: "bg-sky-500",
    RESTORED: "bg-emerald-500",
    CLOSED: "bg-zinc-400 dark:bg-zinc-500",
  };

  const label = getStatusLabel(status, customerPerspective);
  const isLive =
    showPulse && (status === "REPORTED" || status === "IN_PROGRESS");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium",
        className,
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {isLive && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              dotColorClasses[status],
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            dotColorClasses[status],
          )}
        />
      </span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}

export default StatusDot;
