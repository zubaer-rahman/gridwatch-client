"use client";

import {
  Briefcase,
  CheckCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Play,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import OutageDetailDrawer from "@/components/modules/outages/OutageDetailDrawer";
import PriorityLabel from "@/components/modules/outages/PriorityLabel";
import StatusDot from "@/components/modules/outages/StatusDot";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useMyAssignments } from "@/hooks/assignment.hook";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useUpdateOutage } from "@/hooks/outage.hook";
import type { Assignment, OutageStatus } from "@/types";
import { formatRelativeTime, getStatusLabel } from "@/utils/outage.utils";

type FilterTab = "ALL" | "IN_PROGRESS" | "COMPLETED";

export default function MyWorkView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const { user } = useCurrentUser();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useMyAssignments();
  const assignments: Assignment[] = data?.data || [];

  const updateOutageMutation = useUpdateOutage();

  // Metrics
  const { activeCount, inProgressCount, completedCount } = useMemo(() => {
    let active = 0;
    let inProgress = 0;
    let completed = 0;

    for (const a of assignments) {
      const s = a.outage?.status;
      if (s === "ASSIGNED" || s === "IN_PROGRESS") {
        active++;
      }
      if (s === "IN_PROGRESS") {
        inProgress++;
      }
      if (s === "RESTORED" || s === "CLOSED") {
        completed++;
      }
    }

    return {
      activeCount: active,
      inProgressCount: inProgress,
      completedCount: completed,
    };
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const status = a.outage?.status;
      if (activeTab === "IN_PROGRESS") {
        return status === "IN_PROGRESS";
      }
      if (activeTab === "COMPLETED") {
        return status === "RESTORED" || status === "CLOSED";
      }
      return true;
    });
  }, [assignments, activeTab]);

  const handleOpenDetail = (outageId?: string) => {
    if (!outageId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("outage", outageId);
    router.push(`?${params.toString()}`);
  };

  const handleStatusTransition = async (
    outageId: string,
    targetStatus: OutageStatus,
  ) => {
    try {
      await updateOutageMutation.mutateAsync({
        id: outageId,
        payload: { status: targetStatus },
      });
      toast.add({
        title: "Status Updated",
        description: `Incident moved to ${getStatusLabel(targetStatus)}.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to transition status";
      toast.add({
        title: "Update Failed",
        description: message,
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Work Queue
            </h1>
            {isFetching && (
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active field assignments dispatched to operator {user?.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-muted border border-border text-foreground">
            Operator Console
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Assigned Dispatches
            </span>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {isLoading ? "—" : activeCount}
            </span>
            <span className="text-xs text-muted-foreground">
              in active queue
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Work In Progress
            </span>
            <Zap className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {isLoading ? "—" : inProgressCount}
            </span>
            <span className="text-xs text-muted-foreground">
              ongoing repairs
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Completed Restorations
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {isLoading ? "—" : completedCount}
            </span>
            <span className="text-xs text-muted-foreground">
              feeders energized
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                activeTab === "ALL"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Assignments ({assignments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                activeTab === "IN_PROGRESS"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                activeTab === "COMPLETED"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs text-destructive">
              {error?.message || "Failed to load assigned work items"}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No field assignments matching current filter.
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const outage = assignment.outage;
              if (!outage) return null;

              const incidentId = outage.id.slice(0, 8).toUpperCase();
              const locationLabel =
                outage.area?.name ||
                outage.area?.feeder?.name ||
                "Distribution Sector";
              const subName = outage.area?.feeder?.substation?.name;
              const feederName = outage.area?.feeder?.name;

              return (
                <div
                  key={assignment.id}
                  onClick={() => handleOpenDetail(outage.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <StatusDot
                      status={outage.status}
                      showPulse={outage.status === "IN_PROGRESS"}
                      className="mt-1 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-primary">
                          #{incidentId}
                        </span>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {locationLabel}
                        </span>
                        <PriorityLabel priority={outage.priority} />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[feederName, subName].filter(Boolean).join(" • ")}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          Assigned {formatRelativeTime(assignment.createdAt)}
                        </span>
                      </div>

                      {assignment.notes && (
                        <p className="text-xs text-muted-foreground/90 italic mt-1.5 p-2 rounded bg-muted/40 border border-border/50">
                          Note: {assignment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0 self-end md:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {outage.status === "ASSIGNED" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusTransition(outage.id, "IN_PROGRESS")
                        }
                        disabled={updateOutageMutation.isPending}
                        className="h-8 text-xs bg-amber-500 text-black hover:bg-amber-400 font-semibold gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Start Work</span>
                      </Button>
                    )}

                    {outage.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusTransition(outage.id, "RESTORED")
                        }
                        disabled={updateOutageMutation.isPending}
                        className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-500 font-semibold gap-1.5 cursor-pointer"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Mark Restored</span>
                      </Button>
                    )}

                    {(outage.status === "RESTORED" ||
                      outage.status === "CLOSED") && (
                      <span className="text-xs font-mono text-emerald-500 font-medium px-2 py-1 rounded bg-emerald-500/10">
                        Resolved
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(outage.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Outage Detail Drawer */}
      <OutageDetailDrawer />
    </div>
  );
}
