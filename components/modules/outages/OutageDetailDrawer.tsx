"use client";

import {
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Play,
  Save,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import PriorityLabel from "@/components/modules/outages/PriorityLabel";
import StatusDot from "@/components/modules/outages/StatusDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useOutage, useUpdateOutage } from "@/hooks/outage.hook";
import type { OutageStatus } from "@/types";
import {
  canTransition,
  formatDhakaDate,
  formatRelativeTime,
  getStatusLabel,
} from "@/utils/outage.utils";

interface OutageDetailDrawerProps {
  onAssign?: (outageId: string) => void;
}

export default function OutageDetailDrawer({
  onAssign,
}: OutageDetailDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outageId = searchParams.get("outage");

  const { role } = useCurrentUser();

  const { data, isLoading, isError, error, refetch } = useOutage(
    outageId || "",
  );
  const outage = data?.data;

  const updateOutageMutation = useUpdateOutage();

  // Inline ETA editing state
  const [isEditingEta, setIsEditingEta] = useState(false);
  const [etaInput, setEtaInput] = useState("");

  if (!outageId) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("outage");
    router.push(`?${params.toString()}`);
  };

  const handleStatusTransition = async (targetStatus: OutageStatus) => {
    if (!outage) return;

    if (!canTransition(outage.status, targetStatus)) {
      toast.add({
        title: "Invalid Transition",
        description: `Cannot move from ${getStatusLabel(outage.status)} to ${getStatusLabel(targetStatus)}`,
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
        description: `Outage transitioned to ${getStatusLabel(targetStatus)}`,
        type: "success",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.add({
        title: "Transition Failed",
        description: message,
        type: "error",
      });
    }
  };

  const handleSaveEta = async () => {
    if (!outage) return;
    try {
      const isoEta = etaInput ? new Date(etaInput).toISOString() : null;
      await updateOutageMutation.mutateAsync({
        id: outage.id,
        payload: { estimatedRestorationTime: isoEta || undefined },
      });
      setIsEditingEta(false);
      toast.add({
        title: "ETA Updated",
        description: "Estimated restoration time has been adjusted.",
        type: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save ETA";
      toast.add({
        title: "Update Error",
        description: message,
        type: "error",
      });
    }
  };

  // Breadcrumb path calculation
  const zoneName =
    outage?.area?.feeder?.substation?.zone?.name || "National Grid";
  const substationName = outage?.area?.feeder?.substation?.name || "Substation";
  const feederName = outage?.area?.feeder?.name || "Feeder Line";
  const areaName = outage?.area?.name || "Distribution Sector";

  // Operator assignment check
  const primaryAssignment = outage?.assignments?.[0];
  const assignedOperatorName =
    primaryAssignment?.operator?.name ||
    primaryAssignment?.operator?.email ||
    "Unassigned (Queued)";

  const incidentCode = outage?.id.slice(0, 8).toUpperCase() || "";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {outage && (
              <StatusDot
                status={outage.status}
                showPulse={outage.status === "IN_PROGRESS"}
              />
            )}
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md border border-border bg-muted text-foreground">
              #{incidentCode}
            </span>
            <span className="text-sm font-semibold text-foreground truncate max-w-[260px]">
              {outage?.description || "Outage Incident Details"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center">
              <p className="text-xs text-destructive">
                {error?.message || "Failed to load outage details"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3 text-xs"
              >
                Retry
              </Button>
            </div>
          ) : outage ? (
            <>
              {/* Status & Priority Banner */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Dispatch Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusDot
                      status={outage.status}
                      showPulse={outage.status === "IN_PROGRESS"}
                    />
                    <span className="text-sm font-bold text-foreground">
                      {getStatusLabel(outage.status)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Reported {formatRelativeTime(outage.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    Severity Rating
                  </span>
                  <PriorityLabel priority={outage.priority} />
                </div>
              </div>

              {/* Grid Hierarchy Breadcrumbs */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Grid Network Location
                </span>
                <div className="flex items-center gap-1.5 flex-wrap rounded-lg border border-border bg-card p-3 text-xs">
                  <span className="font-semibold text-foreground">
                    {zoneName}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {substationName}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{feederName}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-semibold text-amber-500">
                    {areaName}
                  </span>
                </div>
              </div>

              {/* Grid Specifications / Telemetry */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Operational Metrics
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs text-muted-foreground block">
                      Customer Reports
                    </span>
                    <span className="text-base font-bold text-foreground mt-1 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-500" />
                      {outage.reports?.length ?? outage._count?.reports ?? 0}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        reports
                      </span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs text-muted-foreground block">
                      Assigned Crew
                    </span>
                    <span className="text-xs font-semibold text-foreground mt-1.5 block truncate">
                      {assignedOperatorName}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs text-muted-foreground block">
                      Target Feeder
                    </span>
                    <span className="text-xs font-mono font-medium text-foreground mt-1.5 block truncate">
                      {feederName}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card">
                    <span className="text-xs text-muted-foreground block">
                      Substation
                    </span>
                    <span className="text-xs font-medium text-foreground mt-1.5 block truncate">
                      {substationName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estimated Restoration Time (ETA) Inline Edit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Estimated Restoration Time (ETA)
                  </span>
                  {(role === "OPERATOR" || role === "ADMIN") &&
                    !isEditingEta && (
                      <button
                        type="button"
                        onClick={() => {
                          setEtaInput(
                            outage.estimatedRestorationTime
                              ? new Date(outage.estimatedRestorationTime)
                                  .toISOString()
                                  .slice(0, 16)
                              : "",
                          );
                          setIsEditingEta(true);
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit ETA</span>
                      </button>
                    )}
                </div>

                {isEditingEta ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/40">
                    <Input
                      type="datetime-local"
                      value={etaInput}
                      onChange={(e) => setEtaInput(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveEta}
                      disabled={updateOutageMutation.isPending}
                      className="h-8 text-xs bg-amber-500 text-black hover:bg-amber-400 gap-1"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingEta(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {outage.estimatedRestorationTime
                          ? formatDhakaDate(outage.estimatedRestorationTime)
                          : "Not scheduled yet"}
                      </span>
                    </div>
                    {outage.estimatedRestorationTime && (
                      <span className="text-xs text-muted-foreground font-mono">
                        ({formatRelativeTime(outage.estimatedRestorationTime)})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Audit Timestamps */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Incident Timeline
                </span>
                <div className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-mono text-foreground">
                      {formatDhakaDate(outage.createdAt)}
                    </span>
                  </div>
                  {outage.restoredAt && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="text-emerald-500 font-medium">
                        Restored At
                      </span>
                      <span className="font-mono text-foreground">
                        {formatDhakaDate(outage.restoredAt)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-mono text-foreground">
                      {formatDhakaDate(outage.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        {outage && (
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-xs"
            >
              Close
            </Button>

            <div className="flex items-center gap-2">
              {(outage.status === "REPORTED" ||
                outage.status === "ACKNOWLEDGED") && (
                <>
                  {outage.status === "REPORTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusTransition("ACKNOWLEDGED")}
                      disabled={updateOutageMutation.isPending}
                      className="text-xs gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                      <span>Acknowledge</span>
                    </Button>
                  )}
                  {(role === "OPERATOR" || role === "ADMIN") && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (onAssign) {
                          onAssign(outage.id);
                        } else {
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          params.set("assign", outage.id);
                          router.push(`?${params.toString()}`);
                        }
                      }}
                      className="text-xs bg-amber-500 text-black hover:bg-amber-400 gap-1.5 font-medium cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Assign Operator</span>
                    </Button>
                  )}
                </>
              )}

              {outage.status === "ASSIGNED" &&
                (role === "OPERATOR" || role === "ADMIN") && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusTransition("IN_PROGRESS")}
                    disabled={updateOutageMutation.isPending}
                    className="text-xs bg-amber-500 text-black hover:bg-amber-400 gap-1.5 font-medium"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Work</span>
                  </Button>
                )}

              {outage.status === "IN_PROGRESS" &&
                (role === "OPERATOR" || role === "ADMIN") && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusTransition("RESTORED")}
                    disabled={updateOutageMutation.isPending}
                    className="text-xs bg-emerald-600 text-white hover:bg-emerald-500 gap-1.5 font-medium"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark Restored</span>
                  </Button>
                )}

              {outage.status === "RESTORED" && role === "ADMIN" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusTransition("CLOSED")}
                  disabled={updateOutageMutation.isPending}
                  className="text-xs gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Close Incident</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
