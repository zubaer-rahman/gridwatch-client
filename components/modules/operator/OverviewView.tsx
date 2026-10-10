"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Kanban,
  Plus,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import AssignModal from "@/components/modules/dispatch/AssignModal";
import LogOutageModal from "@/components/modules/outages/LogOutageModal";
import OutageDetailDrawer from "@/components/modules/outages/OutageDetailDrawer";
import PriorityLabel from "@/components/modules/outages/PriorityLabel";
import StatusDot from "@/components/modules/outages/StatusDot";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutages } from "@/hooks/outage.hook";
import type { Outage } from "@/types";
import { formatRelativeTime } from "@/utils/outage.utils";

export default function OverviewView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, refetch, isFetching } = useOutages();
  const allOutages: Outage[] = data?.data || [];

  // Metrics calculations
  const {
    activeCount,
    highActiveCount,
    mediumActiveCount,
    lowActiveCount,
    restoredTodayCount,
    criticalCount,
    mttrDisplay,
    unassignedOutages,
    recentOutages,
  } = useMemo(() => {
    const active = allOutages.filter(
      (o) => o.status !== "RESTORED" && o.status !== "CLOSED",
    );
    const highActive = active.filter((o) => o.priority === "HIGH").length;
    const mediumActive = active.filter((o) => o.priority === "MEDIUM").length;
    const lowActive = active.filter((o) => o.priority === "LOW").length;

    // Restored today in local time
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const restoredToday = allOutages.filter((o) => {
      if (!o.restoredAt) return false;
      const d = new Date(o.restoredAt);
      return d >= todayStart;
    }).length;

    // Critical incidents
    const critical = allOutages.filter(
      (o) => o.priority === "HIGH" && o.status !== "CLOSED",
    ).length;

    // MTTR calculation
    const restoredWithTimes = allOutages.filter(
      (o) =>
        (o.status === "RESTORED" || o.status === "CLOSED") &&
        o.restoredAt &&
        o.createdAt,
    );

    let mttr = "N/A (insufficient data)";
    if (restoredWithTimes.length > 0) {
      const totalMs = restoredWithTimes.reduce((acc, o) => {
        const diff =
          new Date(o.restoredAt || "").getTime() -
          new Date(o.createdAt).getTime();
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      const avgMinutes = Math.round(
        totalMs / restoredWithTimes.length / (1000 * 60),
      );
      if (avgMinutes >= 60) {
        const hours = Math.floor(avgMinutes / 60);
        const mins = avgMinutes % 60;
        mttr = `${hours}h ${mins}m`;
      } else {
        mttr = `${avgMinutes}m`;
      }
    }

    // Unassigned (reported / acknowledged)
    const unassigned = allOutages.filter(
      (o) => o.status === "REPORTED" || o.status === "ACKNOWLEDGED",
    );

    // Latest 5 outages
    const sorted = [...allOutages]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return {
      activeCount: active.length,
      highActiveCount: highActive,
      mediumActiveCount: mediumActive,
      lowActiveCount: lowActive,
      restoredTodayCount: restoredToday,
      criticalCount: critical,
      mttrDisplay: mttr,
      unassignedOutages: unassigned,
      recentOutages: sorted,
    };
  }, [allOutages]);

  const handleOpenDetail = (outageId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("outage", outageId);
    router.push(`?${params.toString()}`);
  };

  const handleOpenAssign = (outageId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("assign", outageId);
    router.push(`?${params.toString()}`);
  };

  const handleOpenLog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("log", "true");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Operations Center
            </h1>
            {isFetching && (
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Asia/Dhaka Telemetry • Live Operations View</span>
          </div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/operator/outages?view=board")}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <Kanban className="h-3.5 w-3.5 text-amber-500" />
            <span>Kanban Board</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenLog}
            className="text-xs bg-amber-500 text-black hover:bg-amber-400 font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Log Outage</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Outages */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Active Outages
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 my-2" />
          ) : (
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">
                {activeCount}
              </span>
              <span className="text-xs text-muted-foreground">incidents</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span className="text-red-500 font-semibold">
              {highActiveCount} High
            </span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">
              {mediumActiveCount} Med
            </span>
            <span>•</span>
            <span>{lowActiveCount} Low</span>
          </div>
        </div>

        {/* Card 2: Restored Today */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Restored Today
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 my-2" />
          ) : (
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">
                {restoredTodayCount}
              </span>
              <span className="text-xs text-muted-foreground">
                feeders recovered
              </span>
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">
            Recorded in current calendar day
          </span>
        </div>

        {/* Card 3: Critical Feeder Alerts */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Critical Alerts
            </span>
            <ShieldAlert
              className={`h-4 w-4 ${
                criticalCount > 0
                  ? "text-red-500 animate-pulse"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 my-2" />
          ) : (
            <div className="my-2 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  criticalCount > 0 ? "text-red-500" : "text-foreground"
                }`}
              >
                {criticalCount}
              </span>
              <span className="text-xs text-muted-foreground">
                high priority
              </span>
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">
            Require immediate crew dispatch
          </span>
        </div>

        {/* Card 4: MTTR Indicator */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Mean Time to Recovery
            </span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-28 my-2" />
          ) : (
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-foreground tracking-tight">
                {mttrDisplay}
              </span>
            </div>
          )}
          <span className="text-[11px] text-muted-foreground">
            Average restoration duration
          </span>
        </div>
      </div>

      {/* Main Layout: 2/3 Left (Recent Outages) & 1/3 Right (Needs Attention) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3): Recent Outages Queue */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Recent Grid Outages
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest reported transmission and distribution incidents
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/operator/outages")}
              className="text-xs text-amber-500 hover:text-amber-400 gap-1 cursor-pointer"
            >
              <span>View all outages</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="divide-y divide-border overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : recentOutages.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No recent outage incidents recorded in grid.
              </div>
            ) : (
              recentOutages.map((outage) => {
                const incidentId = outage.id.slice(0, 8).toUpperCase();
                const locationLabel =
                  outage.area?.name ||
                  outage.area?.feeder?.name ||
                  "Distribution Area";

                return (
                  <div
                    key={outage.id}
                    onClick={() => handleOpenDetail(outage.id)}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusDot status={outage.status} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">
                            #{incidentId}
                          </span>
                          <span className="text-xs font-medium text-foreground truncate">
                            {locationLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                          {outage.description || "Active feeder circuit fault"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <PriorityLabel priority={outage.priority} />
                      <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                        {formatRelativeTime(outage.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
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

        {/* Right Column (1/3): Needs Attention / Unassigned Panel */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-base font-bold text-foreground">
                Needs Attention
              </h2>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-xs font-mono font-bold">
              {unassignedOutages.length} Queued
            </span>
          </div>

          <p className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-muted/20">
            Outages awaiting field operator dispatch.
          </p>

          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : unassignedOutages.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                All reported outages have been dispatched to field crews.
              </div>
            ) : (
              unassignedOutages.map((outage) => {
                const incidentId = outage.id.slice(0, 8).toUpperCase();
                const locationLabel =
                  outage.area?.name ||
                  outage.area?.feeder?.name ||
                  "Area Sector";

                return (
                  <div
                    key={outage.id}
                    className="p-3.5 flex flex-col gap-2 hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(outage.id)}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        #{incidentId}
                      </button>
                      <PriorityLabel priority={outage.priority} />
                    </div>

                    <div className="text-xs font-medium text-foreground truncate">
                      {locationLabel}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                      <span>
                        Reported {formatRelativeTime(outage.createdAt)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleOpenAssign(outage.id)}
                        className="h-6 text-[11px] bg-amber-500 text-black hover:bg-amber-400 font-semibold gap-1 px-2 cursor-pointer"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Dispatch</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <OutageDetailDrawer />
      <AssignModal />
      <LogOutageModal />
    </div>
  );
}
