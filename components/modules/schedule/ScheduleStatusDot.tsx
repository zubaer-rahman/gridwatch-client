import { cn } from "@/lib/utils";
import type { ScheduleStatus } from "@/types";

export interface ScheduleStatusDotProps {
  status: ScheduleStatus;
  className?: string;
  showPulse?: boolean;
}

export function ScheduleStatusDot({
  status,
  className,
  showPulse = true,
}: ScheduleStatusDotProps) {
  const dotColorClasses: Record<ScheduleStatus, string> = {
    UPCOMING: "bg-amber-500",
    ONGOING: "bg-rose-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-zinc-400 dark:bg-zinc-500",
  };

  const labelMap: Record<ScheduleStatus, string> = {
    UPCOMING: "Upcoming",
    ONGOING: "Ongoing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const isLive = showPulse && status === "ONGOING";

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
      <span className="text-foreground">{labelMap[status]}</span>
    </div>
  );
}

export default ScheduleStatusDot;
