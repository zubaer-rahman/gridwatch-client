"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Play,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAreas } from "@/hooks/grid.hook";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useSchedules,
  useUpdateSchedule,
} from "@/hooks/schedule.hook";
import { extractDataArray } from "@/lib/utils";
import type { Area, Schedule, ScheduleStatus } from "@/types";
import { formatDhakaDate, formatRelativeTime } from "@/utils/outage.utils";

export default function ScheduleManagementView() {
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAreaId, setFormAreaId] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [formReason, setFormReason] = useState("");

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Queries
  const { data: areasData } = useAreas();
  const areas = extractDataArray<Area>(areasData?.data) || [];

  const { data: schedulesData, isLoading } = useSchedules();
  const rawSchedules = extractDataArray<Schedule>(schedulesData?.data) || [];

  // Mutations
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: rawSchedules.length,
      upcoming: rawSchedules.filter((s) => s.status === "UPCOMING").length,
      active: rawSchedules.filter((s) => s.status === "ACTIVE").length,
      completed: rawSchedules.filter((s) => s.status === "COMPLETED").length,
      cancelled: rawSchedules.filter((s) => s.status === "CANCELLED").length,
    };
  }, [rawSchedules]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return rawSchedules.filter((sched) => {
      if (selectedAreaFilter !== "ALL" && sched.areaId !== selectedAreaFilter) {
        return false;
      }
      if (
        selectedStatusFilter !== "ALL" &&
        sched.status !== selectedStatusFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesReason = sched.reason?.toLowerCase().includes(query);
        const matchesArea = sched.area?.name.toLowerCase().includes(query);
        if (!matchesReason && !matchesArea) return false;
      }
      return true;
    });
  }, [rawSchedules, selectedAreaFilter, selectedStatusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // in 1 hour
    const end = new Date(now.getTime() + 3 * 60 * 60 * 1000); // in 3 hours

    setFormAreaId(areas[0]?.id || "");
    setFormStartsAt(
      new Date(start.getTime() - start.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );
    setFormEndsAt(
      new Date(end.getTime() - end.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );
    setFormReason("");
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAreaId) {
      toast.add({
        title: "Area Required",
        description: "Please select an affected delivery area.",
        type: "error",
      });
      return;
    }

    if (!formStartsAt || !formEndsAt) {
      toast.add({
        title: "Times Required",
        description: "Please specify both start and end timestamps.",
        type: "error",
      });
      return;
    }

    if (new Date(formStartsAt) >= new Date(formEndsAt)) {
      toast.add({
        title: "Invalid Window",
        description: "Start time must be strictly before end time.",
        type: "error",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        areaId: formAreaId,
        startsAt: new Date(formStartsAt).toISOString(),
        endsAt: new Date(formEndsAt).toISOString(),
        reason: formReason.trim() || undefined,
      });

      toast.add({
        title: "Schedule Created",
        description:
          "Maintenance window scheduled and broadcast to affected consumers.",
        type: "success",
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create schedule";
      toast.add({
        title: "Scheduling Conflict / Error",
        description: msg,
        type: "error",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: ScheduleStatus) => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { status: newStatus },
      });
      toast.add({
        title: "Status Updated",
        description: `Schedule status changed to ${newStatus}.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Status transition failed";
      toast.add({
        title: "Update Failed",
        description: msg,
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.add({
        title: "Schedule Removed",
        description: "The maintenance schedule was successfully deleted.",
        type: "success",
      });
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed";
      toast.add({
        title: "Error",
        description: msg,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Load Shedding & Maintenance Schedules
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              PLANNED OUTAGES
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plan, monitor, and broadcast grid load shedding and maintenance
            windows by service area
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Maintenance</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Total Windows</span>
          <p className="text-2xl font-bold font-mono text-foreground">
            {metrics.total}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
          <span className="text-xs text-amber-500 font-medium">Upcoming</span>
          <p className="text-2xl font-bold font-mono text-amber-500">
            {metrics.upcoming}
          </p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-1">
          <span className="text-xs text-rose-500 font-medium">Active Now</span>
          <p className="text-2xl font-bold font-mono text-rose-500">
            {metrics.active}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
          <span className="text-xs text-emerald-500 font-medium">
            Completed
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-500">
            {metrics.completed}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">
            Cancelled
          </span>
          <p className="text-2xl font-bold font-mono text-muted-foreground">
            {metrics.cancelled}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Area Filter */}
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Delivery Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active (In Progress)</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by reason or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>

        {(selectedAreaFilter !== "ALL" ||
          selectedStatusFilter !== "ALL" ||
          searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAreaFilter("ALL");
              setSelectedStatusFilter("ALL");
              setSearchQuery("");
            }}
            className="text-xs h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Schedules List / Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            No Maintenance Schedules Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            There are currently no load-shedding or preventive maintenance
            windows matching your filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateModal}
            className="gap-1.5 mt-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Schedule</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedules.map((schedule) => {
            const isUpcoming = schedule.status === "UPCOMING";
            const isActive = schedule.status === "ACTIVE";
            const isCompleted = schedule.status === "COMPLETED";

            return (
              <div
                key={schedule.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isActive
                    ? "border-rose-500/40 bg-rose-500/5 shadow-xs"
                    : isUpcoming
                      ? "border-amber-500/30 bg-card hover:border-amber-500/50"
                      : "border-border bg-card/60"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] uppercase font-bold ${
                          isActive
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                            : isUpcoming
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : isCompleted
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {schedule.status}
                      </Badge>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-foreground">
                          {schedule.area?.name || "Target Area"}
                        </span>
                        {schedule.area?.feeder?.name && (
                          <span className="text-[11px] text-muted-foreground/80">
                            ({schedule.area.feeder.name})
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-foreground">
                      {schedule.reason ||
                        "General Grid Maintenance & Inspection"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>
                          {formatDhakaDate(schedule.startsAt)} ➔{" "}
                          {formatDhakaDate(schedule.endsAt)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/60">
                        Planned {formatRelativeTime(schedule.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    {isUpcoming && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(schedule.id, "ACTIVE")
                          }
                          disabled={updateMutation.isPending}
                          className="h-8 text-xs gap-1 border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                        >
                          <Play className="h-3 w-3" />
                          <span>Activate Now</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(schedule.id, "CANCELLED")
                          }
                          disabled={updateMutation.isPending}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}

                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(schedule.id, "COMPLETED")
                        }
                        disabled={updateMutation.isPending}
                        className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Completed</span>
                      </Button>
                    )}

                    {deleteConfirmId === schedule.id ? (
                      <div className="flex items-center gap-1.5 bg-destructive/10 p-1 rounded-lg border border-destructive/20">
                        <span className="text-[11px] text-destructive font-medium px-1">
                          Confirm?
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          disabled={deleteMutation.isPending}
                          className="h-6 px-2 text-[10px]"
                        >
                          Yes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(null)}
                          className="h-6 px-2 text-[10px]"
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(schedule.id)}
                        className="h-8 px-2 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule New Maintenance Window */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-semibold text-foreground">
                  Schedule Grid Maintenance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Delivery Area Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target Delivery Area{" "}
                  <span className="text-destructive">*</span>
                </label>
                <select
                  value={formAreaId}
                  onChange={(e) => setFormAreaId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Residents and businesses in this area will be alerted of the
                  outage.
                </p>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Start Window <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    End Window <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Maintenance Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reason & Engineering Task
                </label>
                <Textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. Substation Transformer Overhaul & Busbar Tightening"
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold cursor-pointer shadow-xs"
                >
                  {createMutation.isPending
                    ? "Scheduling..."
                    : "Confirm Schedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
