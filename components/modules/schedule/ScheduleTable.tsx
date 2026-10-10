"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  MoreVertical,
  Play,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Schedule, ScheduleStatus } from "@/types";
import { formatDhakaDate, formatRelativeTime } from "@/utils/outage.utils";
import ScheduleStatusDot from "./ScheduleStatusDot";

export interface ScheduleTableProps {
  schedules: Schedule[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onStatusChange: (id: string, newStatus: ScheduleStatus) => Promise<void>;
  onDelete: (id: string) => void;
  onLogNew?: () => void;
}

export function ScheduleTable({
  schedules,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onStatusChange,
  onDelete,
  onLogNew,
}: ScheduleTableProps) {
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <h3 className="font-semibold text-foreground">
          Failed to Load Maintenance Schedules
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm">
          {errorMessage ||
            "Unable to retrieve maintenance schedules from grid servers."}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Connection
          </Button>
        )}
      </div>
    );
  }

  if (!isLoading && schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <CalendarClock className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
        <p className="text-sm font-medium text-foreground">
          No Maintenance Schedules Found
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm">
          No active, upcoming, or past load shedding windows match your current
          filter criteria.
        </p>
        {onLogNew && (
          <Button
            size="sm"
            onClick={onLogNew}
            className="bg-amber-500 font-medium text-black hover:bg-amber-400 gap-1.5"
          >
            Schedule Maintenance
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
            <TableHead className="w-[120px] font-mono text-xs">
              SCHEDULE ID
            </TableHead>
            <TableHead className="text-xs font-semibold">
              GRID LOCATION
            </TableHead>
            <TableHead className="text-xs font-semibold">
              REASON / PURPOSE
            </TableHead>
            <TableHead className="w-[140px] text-xs font-semibold">
              STATUS
            </TableHead>
            <TableHead className="w-[160px] text-xs font-semibold">
              STARTS AT
            </TableHead>
            <TableHead className="w-[160px] text-xs font-semibold">
              ENDS AT
            </TableHead>
            <TableHead className="w-[130px] text-right text-xs font-semibold">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => {
            const areaName = schedule.area?.name || "Unassigned Area";
            const feederName = schedule.area?.feeder?.name;
            const subName = schedule.area?.feeder?.substation?.name;
            const isUpcoming = schedule.status === "UPCOMING";
            const isOngoing = schedule.status === "ONGOING";

            return (
              <TableRow
                key={schedule.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-xs font-medium text-amber-500">
                  {schedule.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                      {areaName}
                    </span>
                    {(feederName || subName) && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {[feederName, subName].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[240px]">
                  <p className="text-xs text-muted-foreground truncate">
                    {schedule.reason || "General preventive maintenance"}
                  </p>
                </TableCell>
                <TableCell>
                  <ScheduleStatusDot status={schedule.status} showPulse />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs font-mono">
                    <span className="text-foreground">
                      {formatDhakaDate(schedule.startsAt)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(schedule.startsAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {formatDhakaDate(schedule.endsAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isUpcoming && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onStatusChange(schedule.id, "ONGOING")}
                        className="h-7 text-[11px] gap-1 px-2 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Play className="h-3 w-3" />
                        <span>Start</span>
                      </Button>
                    )}

                    {isOngoing && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onStatusChange(schedule.id, "COMPLETED")}
                        className="h-7 text-[11px] gap-1 px-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Complete</span>
                      </Button>
                    )}

                    {/* Context Menu for Cancel & Delete */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {(isUpcoming || isOngoing) && (
                          <DropdownMenuItem
                            onClick={() =>
                              onStatusChange(schedule.id, "CANCELLED")
                            }
                            className="cursor-pointer text-xs"
                          >
                            <X className="mr-2 h-3.5 w-3.5" />
                            <span>Cancel Window</span>
                          </DropdownMenuItem>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ScheduleTable;
