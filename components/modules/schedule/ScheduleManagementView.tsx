"use client";

import { Kanban, List, Plus, RefreshCw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import OutagesSkeleton from "@/components/modules/outages/OutagesSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useAreas } from "@/hooks/grid.hook";
import {
  useDeleteSchedule,
  useSchedules,
  useUpdateSchedule,
} from "@/hooks/schedule.hook";
import { useDebounce } from "@/hooks/use-debounce";
import { extractDataArray } from "@/lib/utils";
import type { Area, Schedule, ScheduleStatus } from "@/types";
import CreateScheduleModal from "./CreateScheduleModal";
import ScheduleKanban from "./ScheduleKanban";
import ScheduleTable from "./ScheduleTable";

export default function ScheduleManagementView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL search params
  const statusParam = (searchParams.get("status") || "ALL").toUpperCase();
  const areaParam = searchParams.get("area") || "ALL";
  const initialSearch = searchParams.get("q") || "";
  const rawView = searchParams.get("view") || "table";
  const isBoardView = rawView === "board" || rawView === "kanban";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 250);

  // Queries
  const { data: areasData } = useAreas();
  const areas = extractDataArray<Area>(areasData?.data) || [];

  const {
    data: schedulesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSchedules();
  const allSchedules = extractDataArray<Schedule>(schedulesData?.data) || [];

  // Mutations
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  // Update URL helper
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value.toLowerCase());
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    return {
      ALL: allSchedules.length,
      UPCOMING: allSchedules.filter((s) => s.status === "UPCOMING").length,
      ONGOING: allSchedules.filter((s) => s.status === "ONGOING").length,
      COMPLETED: allSchedules.filter((s) => s.status === "COMPLETED").length,
      CANCELLED: allSchedules.filter((s) => s.status === "CANCELLED").length,
    };
  }, [allSchedules]);

  const statusTabs: Array<{ id: string; label: string; count: number }> = [
    { id: "ALL", label: "All Schedules", count: statusCounts.ALL },
    { id: "UPCOMING", label: "Upcoming", count: statusCounts.UPCOMING },
    { id: "ONGOING", label: "Ongoing", count: statusCounts.ONGOING },
    { id: "COMPLETED", label: "Completed", count: statusCounts.COMPLETED },
    { id: "CANCELLED", label: "Cancelled", count: statusCounts.CANCELLED },
  ];

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter((schedule) => {
      // Status filter
      if (statusParam !== "ALL" && schedule.status !== statusParam) {
        return false;
      }
      // Area filter
      if (areaParam !== "ALL" && schedule.areaId !== areaParam) {
        return false;
      }
      // Search filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const areaName = schedule.area?.name?.toLowerCase() || "";
        const feederName = schedule.area?.feeder?.name?.toLowerCase() || "";
        const subName =
          schedule.area?.feeder?.substation?.name?.toLowerCase() || "";
        const reason = schedule.reason?.toLowerCase() || "";
        const id = schedule.id.toLowerCase();

        return (
          id.includes(query) ||
          areaName.includes(query) ||
          feederName.includes(query) ||
          subName.includes(query) ||
          reason.includes(query)
        );
      }
      return true;
    });
  }, [allSchedules, statusParam, areaParam, debouncedSearch]);

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
        title: "Schedule Deleted",
        description: "The maintenance window has been removed.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete schedule";
      toast.add({
        title: "Delete Failed",
        description: msg,
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
              Maintenance Schedules
            </h1>
            {isFetching && (
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Planned load shedding and preventive maintenance windows across
            Bangladesh
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Table / Kanban View Toggle */}
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => updateQuery("view", "table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                !isBoardView
                  ? "bg-amber-500 text-black shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Table view"
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => updateQuery("view", "board")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                isBoardView
                  ? "bg-amber-500 text-black shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Kanban board view"
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
          </div>

          {/* Schedule Window Trigger */}
          <Button
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("log", "true");
              router.push(`?${params.toString()}`);
            }}
            className="bg-amber-500 font-medium text-black hover:bg-amber-400 gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Window</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status segmented filters */}
        <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border overflow-x-auto max-w-full">
          {statusTabs.map((tab) => {
            const isActive = statusParam === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateQuery("status", tab.id)}
                className={`px-3 py-1 text-xs font-medium transition-all whitespace-nowrap rounded-lg flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-amber-500/20 text-amber-500 font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search bar & Area dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search area, reason..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="w-44">
            <Select
              value={areaParam}
              onChange={(e) => updateQuery("area", e.target.value)}
              className="h-9 text-xs"
            >
              <option value="ALL">All Delivery Areas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Data View */}
      {isLoading ? (
        <OutagesSkeleton />
      ) : isBoardView ? (
        <ScheduleKanban
          schedules={filteredSchedules}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ) : (
        <ScheduleTable
          schedules={filteredSchedules}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          onRetry={() => refetch()}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onLogNew={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("log", "true");
            router.push(`?${params.toString()}`);
          }}
        />
      )}

      {/* Create Schedule Modal */}
      <CreateScheduleModal />
    </div>
  );
}
