"use client";

import {
  CheckCircle2,
  Clock,
  MapPin,
  MoreVertical,
  MoveRight,
  Play,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import type { Schedule, ScheduleStatus } from "@/types";
import { formatDhakaDate, formatRelativeTime } from "@/utils/outage.utils";
import ScheduleStatusDot from "./ScheduleStatusDot";

const KANBAN_COLUMNS: ScheduleStatus[] = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

export function canScheduleTransition(
  current: ScheduleStatus,
  target: ScheduleStatus,
): boolean {
  if (current === target) return false;
  if (current === "UPCOMING") {
    return target === "ONGOING" || target === "CANCELLED";
  }
  if (current === "ONGOING") {
    return target === "COMPLETED" || target === "CANCELLED";
  }
  return false;
}

export function getNextPermittedScheduleStatuses(
  status: ScheduleStatus,
): ScheduleStatus[] {
  if (status === "UPCOMING") return ["ONGOING", "CANCELLED"];
  if (status === "ONGOING") return ["COMPLETED", "CANCELLED"];
  return [];
}

export function getScheduleStatusLabel(status: ScheduleStatus): string {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "ONGOING":
      return "Ongoing";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
  }
}

interface ScheduleKanbanProps {
  schedules: Schedule[];
  isLoading?: boolean;
  onStatusChange: (id: string, newStatus: ScheduleStatus) => Promise<void>;
  onDelete: (id: string) => void;
}

export default function ScheduleKanban({
  schedules,
  isLoading = false,
  onStatusChange,
  onDelete,
}: ScheduleKanbanProps) {
  const [draggedScheduleId, setDraggedScheduleId] = useState<string | null>(
    null,
  );
  const [dragOverColumn, setDragOverColumn] = useState<ScheduleStatus | null>(
    null,
  );

  const handleStatusChangeInternal = async (
    schedule: Schedule,
    targetStatus: ScheduleStatus,
  ) => {
    if (schedule.status === targetStatus) return;

    if (!canScheduleTransition(schedule.status, targetStatus)) {
      toast.add({
        title: "Invalid Transition",
        description: `Cannot move schedule from ${getScheduleStatusLabel(schedule.status)} to ${getScheduleStatusLabel(targetStatus)}.`,
        type: "error",
      });
      return;
    }

    await onStatusChange(schedule.id, targetStatus);
  };

  const handleDragStart = (e: React.DragEvent, scheduleId: string) => {
    e.dataTransfer.setData("text/plain", scheduleId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedScheduleId(scheduleId);
  };

  const handleDragOver = (e: React.DragEvent, status: ScheduleStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, status: ScheduleStatus) => {
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetStatus: ScheduleStatus,
  ) => {
    e.preventDefault();
    setDragOverColumn(null);
    const scheduleId =
      e.dataTransfer.getData("text/plain") || draggedScheduleId;
    setDraggedScheduleId(null);

    if (!scheduleId) return;
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    await handleStatusChangeInternal(schedule, targetStatus);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div
            key={col}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3 min-w-[260px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 items-start">
      {KANBAN_COLUMNS.map((status) => {
        const columnSchedules = schedules.filter((s) => s.status === status);
        const isDragOver = dragOverColumn === status;

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={(e) => handleDragLeave(e, status)}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex flex-col gap-3 rounded-xl border p-3 min-w-[260px] min-h-[480px] transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card/40"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <ScheduleStatusDot
                  status={status}
                  showPulse={status === "ONGOING"}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {getScheduleStatusLabel(status)}
                </span>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                {columnSchedules.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-2.5 flex-1">
              {columnSchedules.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground/60">
                  No schedules
                </div>
              ) : (
                columnSchedules.map((schedule) => {
                  const permittedTransitions = getNextPermittedScheduleStatuses(
                    schedule.status,
                  );
                  const scheduleId = schedule.id.slice(0, 8).toUpperCase();
                  const locationName =
                    schedule.area?.name ||
                    schedule.area?.feeder?.name ||
                    "Grid Delivery Area";
                  const subOrFeeder =
                    schedule.area?.feeder?.substation?.name ||
                    schedule.area?.feeder?.name;

                  return (
                    <div
                      key={schedule.id}
                      draggable={permittedTransitions.length > 0}
                      onDragStart={(e) => handleDragStart(e, schedule.id)}
                      className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-xs transition-all hover:border-primary/40 hover:shadow-md cursor-grab active:cursor-grabbing"
                    >
                      {/* Top Row: Schedule Code + Status/Menu */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-semibold text-primary">
                          #{scheduleId}
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                            {schedule.status}
                          </span>

                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground opacity-60 group-hover:opacity-100 hover:bg-muted transition cursor-pointer">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                Transition Status
                              </div>
                              {permittedTransitions.length === 0 ? (
                                <div className="px-2 py-1 text-xs text-muted-foreground italic">
                                  No further transitions
                                </div>
                              ) : (
                                permittedTransitions.map((next) => (
                                  <DropdownMenuItem
                                    key={next}
                                    onClick={() =>
                                      handleStatusChangeInternal(schedule, next)
                                    }
                                    className="cursor-pointer text-xs flex items-center justify-between"
                                  >
                                    <span>{getScheduleStatusLabel(next)}</span>
                                    <MoveRight className="h-3 w-3 text-muted-foreground" />
                                  </DropdownMenuItem>
                                ))
                              )}
                              <DropdownMenuItem
                                onClick={() => onDelete(schedule.id)}
                                className="cursor-pointer text-xs text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                <span>Delete Schedule</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {schedule.reason ||
                          "Planned load shedding and preventive grid maintenance"}
                      </p>

                      {/* Location details */}
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">
                          {locationName}
                          {subOrFeeder ? ` (${subOrFeeder})` : ""}
                        </span>
                      </div>

                      {/* Action Button: Start or Complete */}
                      {schedule.status === "UPCOMING" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChangeInternal(schedule, "ONGOING");
                          }}
                          className="w-full mt-0.5 h-7 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="h-3 w-3" />
                          <span>Start Maintenance</span>
                        </button>
                      )}

                      {schedule.status === "ONGOING" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChangeInternal(schedule, "COMPLETED");
                          }}
                          className="w-full mt-0.5 h-7 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Complete & Restore</span>
                        </button>
                      )}

                      {/* Footer metadata */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-muted-foreground/60" />
                          <span>{formatDhakaDate(schedule.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <span>{formatRelativeTime(schedule.startsAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
