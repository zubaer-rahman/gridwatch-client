"use client";

import {
  Clock,
  MapPin,
  MoreVertical,
  MoveRight,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PriorityLabel from "@/components/modules/outages/PriorityLabel";
import StatusDot from "@/components/modules/outages/StatusDot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useUpdateOutage } from "@/hooks/outage.hook";
import type { Outage, OutageStatus } from "@/types";
import {
  canTransition,
  formatRelativeTime,
  getNextPermittedStatuses,
  getStatusLabel,
} from "@/utils/outage.utils";

const KANBAN_COLUMNS: OutageStatus[] = [
  "REPORTED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESTORED",
  "CLOSED",
];

interface OutagesKanbanProps {
  outages: Outage[];
  isLoading?: boolean;
}

export default function OutagesKanban({
  outages,
  isLoading = false,
}: OutagesKanbanProps) {
  const router = useRouter();
  const updateOutageMutation = useUpdateOutage();
  const [draggedOutageId, setDraggedOutageId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<OutageStatus | null>(
    null,
  );

  const handleStatusChange = async (
    outage: Outage,
    targetStatus: OutageStatus,
  ) => {
    if (outage.status === targetStatus) return;

    if (!canTransition(outage.status, targetStatus)) {
      toast.add({
        title: "Invalid Transition",
        description: `Cannot move from ${getStatusLabel(outage.status)} to ${getStatusLabel(targetStatus)}: invalid transition`,
        type: "error",
      });
      return;
    }

    try {
      await updateOutageMutation.mutateAsync({
        id: outage.id,
        payload: { status: targetStatus },
      });
      toast.add({
        title: "Status Updated",
        description: `Incident ${outage.id.slice(0, 8).toUpperCase()} moved to ${getStatusLabel(targetStatus)}`,
        type: "success",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update outage status";
      toast.add({
        title: "Update Failed",
        description: message,
        type: "error",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, outageId: string) => {
    e.dataTransfer.setData("text/plain", outageId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedOutageId(outageId);
  };

  const handleDragOver = (e: React.DragEvent, status: OutageStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, status: OutageStatus) => {
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OutageStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const outageId = e.dataTransfer.getData("text/plain") || draggedOutageId;
    setDraggedOutageId(null);

    if (!outageId) return;
    const outage = outages.find((o) => o.id === outageId);
    if (!outage) return;

    handleStatusChange(outage, targetStatus);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
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
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start">
      {KANBAN_COLUMNS.map((status) => {
        const columnOutages = outages.filter((o) => o.status === status);
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
                <StatusDot
                  status={status}
                  showPulse={status === "IN_PROGRESS"}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {getStatusLabel(status)}
                </span>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                {columnOutages.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-2.5 flex-1">
              {columnOutages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground/60">
                  No incidents
                </div>
              ) : (
                columnOutages.map((outage) => {
                  const permittedTransitions = getNextPermittedStatuses(
                    outage.status,
                  );
                  const incidentId = outage.id.slice(0, 8).toUpperCase();
                  const locationName =
                    outage.area?.name ||
                    outage.area?.feeder?.name ||
                    "Grid Location";

                  return (
                    <div
                      key={outage.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, outage.id)}
                      className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-xs transition-all hover:border-primary/40 hover:shadow-md cursor-grab active:cursor-grabbing"
                    >
                      {/* Top Row: Incident Code + Priority */}
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const params = new URLSearchParams(
                              window.location.search,
                            );
                            params.set("outage", outage.id);
                            router.push(`?${params.toString()}`);
                          }}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          #{incidentId}
                        </button>
                        <div className="flex items-center gap-1">
                          <PriorityLabel priority={outage.priority} />
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
                                      handleStatusChange(outage, next)
                                    }
                                    className="cursor-pointer text-xs flex items-center justify-between"
                                  >
                                    <span>{getStatusLabel(next)}</span>
                                    <MoveRight className="h-3 w-3 text-muted-foreground" />
                                  </DropdownMenuItem>
                                ))
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {outage.description || "Active feeder outage incident"}
                      </p>

                      {/* Location details */}
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{locationName}</span>
                      </div>

                      {/* Direct Dispatch Crew Action */}
                      {(outage.status === "REPORTED" ||
                        outage.status === "ACKNOWLEDGED") && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const params = new URLSearchParams(
                              window.location.search,
                            );
                            params.set("assign", outage.id);
                            router.push(`?${params.toString()}`);
                          }}
                          className="w-full mt-0.5 h-7 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Zap className="h-3 w-3" />
                          <span>Dispatch Crew</span>
                        </button>
                      )}

                      {/* Footer metadata */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground/60" />
                          <span>
                            {outage.reports?.length ??
                              outage._count?.reports ??
                              0}{" "}
                            reports
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground/60" />
                          <span>{formatRelativeTime(outage.createdAt)}</span>
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
