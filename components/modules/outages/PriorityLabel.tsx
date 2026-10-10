import { cn } from "@/lib/utils";
import type { Priority } from "@/types";
import { getPriorityLabel } from "@/utils/outage.utils";

export interface PriorityLabelProps {
  priority: Priority;
  className?: string;
}

export function PriorityLabel({ priority, className }: PriorityLabelProps) {
  const priorityStyles: Record<
    Priority,
    { text: string; bg: string; dot: string }
  > = {
    HIGH: {
      text: "text-red-600 dark:text-red-400 font-semibold",
      bg: "bg-red-500/10 border-red-500/20",
      dot: "bg-red-500",
    },
    MEDIUM: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      dot: "bg-amber-500",
    },
    LOW: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      dot: "bg-emerald-500",
    },
  };

  const style = priorityStyles[priority] || priorityStyles.MEDIUM;
  const label = getPriorityLabel(priority);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium font-mono",
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {label}
    </span>
  );
}

export default PriorityLabel;
