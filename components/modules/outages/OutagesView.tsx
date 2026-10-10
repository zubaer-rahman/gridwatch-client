"use client";

import { Kanban, List, Plus, RefreshCw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import AssignModal from "@/components/modules/dispatch/AssignModal";
import LogOutageModal from "@/components/modules/outages/LogOutageModal";
import OutageDetailDrawer from "@/components/modules/outages/OutageDetailDrawer";
import OutagesKanban from "@/components/modules/outages/OutagesKanban";
import OutagesSkeleton from "@/components/modules/outages/OutagesSkeleton";
import OutagesTable from "@/components/modules/outages/OutagesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useOutages } from "@/hooks/outage.hook";
import { useDebounce } from "@/hooks/use-debounce";
import type { Outage } from "@/types";

function OutagesViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL search params
  const statusParam = (searchParams.get("status") || "ALL").toUpperCase();
  const priorityParam = (searchParams.get("priority") || "ALL").toUpperCase();
  const initialSearch = searchParams.get("q") || "";
  const rawView = searchParams.get("view") || "table";
  const isBoardView = rawView === "board" || rawView === "kanban";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 250);

  // Fetch live outages from backend API
  const { data, isLoading, isError, error, refetch, isFetching } = useOutages();
  const allOutages: Outage[] = data?.data || [];

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

  // Filter outages in memory based on current filters and search
  const filteredOutages = useMemo(() => {
    return allOutages.filter((outage) => {
      // Status filter
      if (statusParam !== "ALL" && outage.status !== statusParam) {
        return false;
      }
      // Priority filter
      if (priorityParam !== "ALL" && outage.priority !== priorityParam) {
        return false;
      }
      // Search filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const areaName = outage.area?.name?.toLowerCase() || "";
        const feederName = outage.area?.feeder?.name?.toLowerCase() || "";
        const desc = outage.description?.toLowerCase() || "";
        const id = outage.id.toLowerCase();
        return (
          id.includes(query) ||
          areaName.includes(query) ||
          feederName.includes(query) ||
          desc.includes(query)
        );
      }
      return true;
    });
  }, [allOutages, statusParam, priorityParam, debouncedSearch]);

  const statusCounts = useMemo(() => {
    return {
      ALL: allOutages.length,
      REPORTED: allOutages.filter((o) => o.status === "REPORTED").length,
      ASSIGNED: allOutages.filter((o) => o.status === "ASSIGNED").length,
      IN_PROGRESS: allOutages.filter((o) => o.status === "IN_PROGRESS").length,
      RESTORED: allOutages.filter((o) => o.status === "RESTORED").length,
      CLOSED: allOutages.filter((o) => o.status === "CLOSED").length,
    };
  }, [allOutages]);

  const statusTabs: Array<{ id: string; label: string; count: number }> = [
    { id: "ALL", label: "All Incidents", count: statusCounts.ALL },
    { id: "REPORTED", label: "Reported", count: statusCounts.REPORTED },
    { id: "ASSIGNED", label: "Assigned", count: statusCounts.ASSIGNED },
    {
      id: "IN_PROGRESS",
      label: "In Progress",
      count: statusCounts.IN_PROGRESS,
    },
    { id: "RESTORED", label: "Restored", count: statusCounts.RESTORED },
    { id: "CLOSED", label: "Closed", count: statusCounts.CLOSED },
  ];

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Outages Queue
            </h1>
            {isFetching && (
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active transmission & distribution feeder incidents across
            Bangladesh
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Table / Kanban View Toggle */}
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => updateQuery("view", "table")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
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
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
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

          {/* Log Outage Trigger */}
          <Button
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("log", "true");
              router.push(`?${params.toString()}`);
            }}
            className="bg-amber-500 font-medium text-black hover:bg-amber-400 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Log Outage</span>
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
                className={`px-3 py-1 text-xs font-medium transition-all whitespace-nowrap rounded-lg flex items-center gap-1.5 ${
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

        {/* Search bar & Priority dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search area, code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="w-36">
            <Select
              value={priorityParam}
              onChange={(e) => updateQuery("priority", e.target.value)}
              className="h-9 text-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Outage Data View */}
      {isLoading ? (
        <OutagesSkeleton />
      ) : isBoardView ? (
        <OutagesKanban outages={filteredOutages} isLoading={isLoading} />
      ) : (
        <OutagesTable
          outages={filteredOutages}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          onRetry={() => refetch()}
          onLogNew={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("log", "true");
            router.push(`?${params.toString()}`);
          }}
        />
      )}

      {/* Outage Detail Drawer */}
      <OutageDetailDrawer />

      {/* Operator Dispatch Assignment Modal */}
      <AssignModal />

      {/* Log Outage Modal */}
      <LogOutageModal />
    </div>
  );
}

export function OutagesView() {
  return (
    <Suspense fallback={<OutagesSkeleton />}>
      <OutagesViewContent />
    </Suspense>
  );
}

export default OutagesView;
