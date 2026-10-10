"use client";

import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  PowerOff,
  UserCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAreas } from "@/hooks/grid.hook";
import { useOutages } from "@/hooks/outage.hook";
import { useSchedules } from "@/hooks/schedule.hook";
import { extractDataArray } from "@/lib/utils";
import type { Schedule } from "@/types";
import { formatDhakaDate, formatRelativeTime } from "@/utils/outage.utils";

interface AreaStatusCardProps {
  selectedAreaId: string;
  onSelectAreaId: (id: string) => void;
  onOpenReportModal: () => void;
}

export default function AreaStatusCard({
  selectedAreaId,
  onSelectAreaId,
  onOpenReportModal,
}: AreaStatusCardProps) {
  const { data: areasData, isLoading: isLoadingAreas } = useAreas();
  const areas = areasData?.data || [];

  const currentArea = areas.find((a) => a.id === selectedAreaId) || areas[0];
  const activeAreaId = currentArea?.id || "";

  // Query schedules for this area
  const { data: schedulesData } = useSchedules(
    activeAreaId ? { areaId: activeAreaId } : undefined,
  );
  const allSchedules = extractDataArray<Schedule>(schedulesData?.data) || [];
  const activeOrUpcomingSchedules = allSchedules.filter(
    (s) => s.status === "ACTIVE" || s.status === "UPCOMING",
  );

  // Query outages for this area
  const { data: outagesData, isLoading: isLoadingOutages } = useOutages({
    areaId: activeAreaId || undefined,
  });

  const allOutages = outagesData?.data || [];
  const activeOutage = allOutages.find(
    (o) => o.status !== "RESTORED" && o.status !== "CLOSED",
  );

  const hasOutage = Boolean(activeOutage);

  // Stepper calculations
  const isReported = Boolean(activeOutage);
  const isDispatched =
    activeOutage?.status === "ASSIGNED" ||
    activeOutage?.status === "IN_PROGRESS" ||
    activeOutage?.status === "RESTORED" ||
    activeOutage?.status === "CLOSED";
  const isInProgress =
    activeOutage?.status === "IN_PROGRESS" ||
    activeOutage?.status === "RESTORED" ||
    activeOutage?.status === "CLOSED";
  const isRestored =
    activeOutage?.status === "RESTORED" || activeOutage?.status === "CLOSED";

  const assignedOperator = activeOutage?.assignments?.[0]?.operator;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
      {/* Top Header & Area Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${
              hasOutage
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {hasOutage ? (
              <PowerOff className="h-6 w-6 animate-pulse" />
            ) : (
              <Zap className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {currentArea?.name || "Distribution Sector"}
              </h2>
              <Badge
                variant={hasOutage ? "destructive" : "outline"}
                className={`text-[11px] font-mono uppercase ${
                  hasOutage
                    ? ""
                    : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                }`}
              >
                {hasOutage ? "OUTAGE ACTIVE" : "GRID SUPPLY NORMAL"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {currentArea?.feeder?.name
                  ? `Feeder: ${currentArea.feeder.name}`
                  : "National Distribution Grid"}
              </span>
            </p>
          </div>
        </div>

        {/* Area Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-muted-foreground uppercase">
            Sector:
          </span>
          <select
            value={activeAreaId}
            onChange={(e) => onSelectAreaId(e.target.value)}
            disabled={isLoadingAreas}
            className="h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Status Display */}
      {isLoadingOutages ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : hasOutage && activeOutage ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  Active Outage:{" "}
                  {activeOutage.description || "Unscheduled Outage"}
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-mono w-fit">
                Priority: {activeOutage.priority}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground pt-1 border-t border-destructive/10">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  Reported: {formatRelativeTime(activeOutage.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-primary font-medium">
                  Target Resolution:
                </span>
                <span>
                  {activeOutage.estimatedRestorationTime
                    ? formatDhakaDate(activeOutage.estimatedRestorationTime)
                    : "Crew assessing on site"}
                </span>
              </div>
            </div>
          </div>

          {/* Restoration Progress Stepper */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Restoration Progress
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Step 1: Reported */}
              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isReported
                    ? "border-primary/30 bg-primary/5 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      isReported ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-xs font-semibold">1. Reported</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Outage recorded in central dispatcher telemetry.
                </p>
              </div>

              {/* Step 2: Dispatched */}
              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isDispatched
                    ? "border-primary/30 bg-primary/5 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      isDispatched ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-xs font-semibold">2. Dispatched</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {assignedOperator
                    ? `Assigned: ${assignedOperator.name}`
                    : "Field crew queued for sector."}
                </p>
              </div>

              {/* Step 3: On Site */}
              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isInProgress
                    ? "border-primary/30 bg-primary/5 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      isInProgress ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-xs font-semibold">3. On Site</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Technicians isolating fault and restoring feeder line.
                </p>
              </div>

              {/* Step 4: Restored */}
              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isRestored
                    ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      isRestored ? "text-emerald-500" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-xs font-semibold">4. Restored</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Grid synchronized & premises energized.
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Crew Contact (if available) */}
          {assignedOperator && (
            <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Dispatched Technician:
                </span>
                <span className="font-semibold text-foreground">
                  {assignedOperator.name}
                </span>
              </div>
              {assignedOperator.contactNumber && (
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Phone className="h-3 w-3" />
                  <span>{assignedOperator.contactNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Normal Grid Supply Telemetry State */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground block">
                Line Voltage
              </span>
              <span className="text-2xl font-bold font-mono text-foreground block mt-1">
                224.6 V
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
                Within ±2% Tolerance
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground block">
                Grid Frequency
              </span>
              <span className="text-2xl font-bold font-mono text-foreground block mt-1">
                50.02 Hz
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
                Phase Synchronized
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground block">
                Supply Availability
              </span>
              <span className="text-2xl font-bold font-mono text-foreground block mt-1">
                100%
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                No active load shedding
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground block">
                Emergency Dispatch
              </span>
              <span className="text-2xl font-bold font-mono text-primary block mt-1">
                On Standby
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                24/7 National Grid Monitoring
              </span>
            </div>
          </div>

          {/* Planned Maintenance & Load Shedding Advisory */}
          {activeOrUpcomingSchedules.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-amber-500" />
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Scheduled Maintenance & Load Shedding
                  </h4>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-amber-500/40 text-amber-500 font-mono"
                >
                  {activeOrUpcomingSchedules.length} Planned
                </Badge>
              </div>

              <div className="divide-y divide-border/40">
                {activeOrUpcomingSchedules.map((sched) => (
                  <div
                    key={sched.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {sched.reason || "Scheduled Grid Maintenance"}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono px-1.5 py-0 ${
                            sched.status === "ACTIVE"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          }`}
                        >
                          {sched.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDhakaDate(sched.startsAt)} —{" "}
                          {formatDhakaDate(sched.endsAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                Continuous SCADA telemetry feed active for {currentArea?.name}.
              </span>
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReportModal}
              className="gap-1.5 self-start sm:self-auto"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Report Outage</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
