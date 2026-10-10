import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import type { OutageStatus, Priority } from "@/types";

/**
 * Valid state machine transitions strictly enforced by GridWatch backend
 */
export const VALID_OUTAGE_TRANSITIONS: Record<OutageStatus, OutageStatus[]> = {
  REPORTED: ["ACKNOWLEDGED", "ASSIGNED"],
  ACKNOWLEDGED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESTORED"],
  RESTORED: ["CLOSED"],
  CLOSED: [],
};

export function canTransition(
  current: OutageStatus,
  next: OutageStatus,
): boolean {
  return VALID_OUTAGE_TRANSITIONS[current]?.includes(next) ?? false;
}

export function getNextPermittedStatuses(
  current: OutageStatus,
): OutageStatus[] {
  return VALID_OUTAGE_TRANSITIONS[current] || [];
}

export function getStatusLabel(
  status: OutageStatus,
  customerPerspective = false,
): string {
  if (customerPerspective && (status === "RESTORED" || status === "CLOSED")) {
    return "Restored";
  }

  switch (status) {
    case "REPORTED":
      return "Reported";
    case "ACKNOWLEDGED":
      return "Acknowledged";
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESTORED":
      return "Restored";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return priority;
  }
}

/**
 * Bangladesh Currency Formatter (৳ BDT)
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

/**
 * Safe date parsing
 */
function parseDate(date: string | Date): Date | null {
  if (date instanceof Date) return date;
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Formats a date string in Asia/Dhaka standard (e.g. "7 Sep 2026, 3:58 PM")
 */
export function formatDhakaDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  const date = parseDate(dateInput);
  if (!date) return "—";
  try {
    return format(date, "d MMM yyyy, h:mm a");
  } catch {
    return "—";
  }
}

/**
 * Formats relative time elapsed (e.g. "15m ago")
 */
export function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  const date = parseDate(dateInput);
  if (!date) return "—";
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "—";
  }
}
