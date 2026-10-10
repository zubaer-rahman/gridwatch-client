"use client";

import {
  AlertCircle,
  Code2,
  Download,
  FileText,
  Filter,
  History,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/admin.hook";
import { useDebounce } from "@/hooks/use-debounce";
import { extractDataArray, extractMeta } from "@/lib/utils";
import type { AuditLog } from "@/types";
import { formatDhakaDate, formatRelativeTime } from "@/utils/outage.utils";

export default function AuditLogView() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLog | null>(
    null,
  );

  const queryParams = {
    entity: entityFilter !== "ALL" ? entityFilter : undefined,
    action: actionFilter !== "ALL" ? actionFilter : undefined,
    page,
    limit,
  };

  const {
    data: logsResponse,
    isLoading,
    isError,
    refetch,
  } = useAuditLogs(queryParams);

  const logs = extractDataArray<AuditLog>(logsResponse?.data);
  const meta = extractMeta(logsResponse?.data) || logsResponse?.meta;
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1;

  // Filter client-side if search term is active (backend doesn't filter search directly on audit logs)
  const filteredLogs = debouncedSearch
    ? logs.filter((log) => {
        const term = debouncedSearch.toLowerCase();
        return (
          log.action.toLowerCase().includes(term) ||
          log.entity.toLowerCase().includes(term) ||
          log.actorId.toLowerCase().includes(term) ||
          log.entityId.toLowerCase().includes(term)
        );
      })
    : logs;

  // CSV Export utility
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = [
      "ID",
      "Timestamp",
      "Actor ID",
      "Action",
      "Entity",
      "Entity ID",
      "Previous Data",
      "New Data",
    ];

    const rows = logs.map((log) => [
      log.id,
      log.createdAt,
      log.actorId,
      log.action,
      log.entity,
      log.entityId,
      JSON.stringify(log.previousData || {}).replace(/"/g, '""'),
      JSON.stringify(log.newData || {}).replace(/"/g, '""'),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => `"${e.join('","')}"`)].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gridwatch_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Audit Trail & Compliance Chronicle
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              IMMUTABLE LOG
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tamper-evident record of administrative changes, security
            modifications, and grid events
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor, entity ID..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Entity Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              <option value="User">User</option>
              <option value="Outage">Outage</option>
              <option value="Assignment">Assignment</option>
              <option value="DistributionZone">Distribution Zone</option>
              <option value="Substation">Substation</option>
              <option value="Feeder">Feeder</option>
              <option value="Area">Area</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
              <option value="USER_STATUS_CHANGED">USER_STATUS_CHANGED</option>
              <option value="OUTAGE_STATUS_CHANGED">
                OUTAGE_STATUS_CHANGED
              </option>
              <option value="ASSIGNMENT_CREATED">ASSIGNMENT_CREATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-44 rounded-lg" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              Failed to load audit logs
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Could not retrieve audit trail records from the administrative
              service.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              No audit trail events found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are no logged mutations or state changes matching your
              current filters.
            </p>
            {(searchTerm ||
              entityFilter !== "ALL" ||
              actionFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setEntityFilter("ALL");
                  setActionFilter("ALL");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Timestamp / Elapsed</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity Reference</th>
                  <th className="py-3 px-4">Actor Principal</th>
                  <th className="py-3 px-4 text-right">State Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => {
                  const isRoleChange = log.action.includes("ROLE");
                  const isStatusChange = log.action.includes("STATUS");
                  const isCreate =
                    log.action.includes("CREATE") || log.action.includes("ADD");

                  const dotColor = isRoleChange
                    ? "bg-amber-500"
                    : isStatusChange
                      ? "bg-sky-500"
                      : isCreate
                        ? "bg-emerald-500"
                        : "bg-primary";

                  const badgeStyle = isRoleChange
                    ? "border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400"
                    : isStatusChange
                      ? "border-sky-500/30 text-sky-600 bg-sky-500/10 dark:text-sky-400"
                      : isCreate
                        ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                        : "border-border text-muted-foreground bg-muted";

                  const hasDiff = Boolean(log.previousData || log.newData);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-foreground">
                          {formatRelativeTime(log.createdAt)}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {formatDhakaDate(log.createdAt)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`}
                          />
                          <span
                            className={`inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border ${badgeStyle}`}
                          >
                            {log.action}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-foreground">
                          {log.entity}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">
                          {log.entityId}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {log.actorId}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {hasDiff ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                            onClick={() => setSelectedLogForDiff(log)}
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            <span>View Diff</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <div>
              Showing Page{" "}
              <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>{" "}
              ({meta.total} total log records)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* State Mutation Diff Inspection Modal */}
      {selectedLogForDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Audit Event State Diff
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground">
                    {selectedLogForDiff.action} on {selectedLogForDiff.entity} (
                    {selectedLogForDiff.entityId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForDiff(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Previous State */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Previous State
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/30 font-mono text-xs overflow-x-auto max-h-64 text-muted-foreground">
                  {selectedLogForDiff.previousData ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLogForDiff.previousData, null, 2)}
                    </pre>
                  ) : (
                    <span className="italic text-muted-foreground/60">
                      null (No prior state recorded)
                    </span>
                  )}
                </div>
              </div>

              {/* New State */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                  Mutated State
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 font-mono text-xs overflow-x-auto max-h-64 text-foreground">
                  {selectedLogForDiff.newData ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLogForDiff.newData, null, 2)}
                    </pre>
                  ) : (
                    <span className="italic text-muted-foreground/60">
                      null (Entity deleted or no payload)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground flex items-center justify-between">
              <span>Actor ID: {selectedLogForDiff.actorId}</span>
              <span>
                Timestamp: {formatDhakaDate(selectedLogForDiff.createdAt)}
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLogForDiff(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
