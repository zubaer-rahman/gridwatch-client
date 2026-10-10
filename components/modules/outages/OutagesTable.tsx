"use client";

import { AlertCircle, ChevronRight, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PriorityLabel from "@/components/modules/outages/PriorityLabel";
import StatusDot from "@/components/modules/outages/StatusDot";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Outage } from "@/types";
import { formatDhakaDate, formatRelativeTime } from "@/utils/outage.utils";

export interface OutagesTableProps {
  outages: Outage[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelectOutage?: (outage: Outage) => void;
  onLogNew?: () => void;
}

export function OutagesTable({
  outages,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelectOutage,
  onLogNew,
}: OutagesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOpenDetail = (outage: Outage) => {
    if (onSelectOutage) {
      onSelectOutage(outage);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("outage", outage.id);
    router.push(`?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <h3 className="font-semibold text-foreground">
          Failed to Load Outages
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm">
          {errorMessage ||
            "Unable to retrieve outage incidents from distribution server."}
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

  if (!isLoading && outages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm font-medium text-foreground">
          No Outage Incidents Found
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          All distribution feeders and grid areas are operating normally with no
          active incidents.
        </p>
        {onLogNew && (
          <Button
            size="sm"
            onClick={onLogNew}
            className="bg-amber-500 font-medium text-black hover:bg-amber-400"
          >
            Log Outage Incident
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
              INCIDENT ID
            </TableHead>
            <TableHead className="text-xs font-semibold">
              GRID LOCATION
            </TableHead>
            <TableHead className="text-xs font-semibold">DESCRIPTION</TableHead>
            <TableHead className="w-[110px] text-xs font-semibold">
              PRIORITY
            </TableHead>
            <TableHead className="w-[130px] text-xs font-semibold">
              STATUS
            </TableHead>
            <TableHead className="w-[140px] text-xs font-semibold">
              REPORTED
            </TableHead>
            <TableHead className="w-[160px] text-xs font-semibold">
              EST. RESTORATION
            </TableHead>
            <TableHead className="w-[80px] text-right text-xs font-semibold">
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outages.map((outage) => {
            const areaName = outage.area?.name || "Unassigned Area";
            const feederName = outage.area?.feeder?.name;
            const subName = outage.area?.feeder?.substation?.name;

            return (
              <TableRow
                key={outage.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleOpenDetail(outage)}
              >
                <TableCell className="font-mono text-xs font-medium text-amber-500">
                  {outage.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                      {areaName}
                    </span>
                    {(feederName || subName) && (
                      <span className="text-[11px] text-muted-foreground">
                        {[feederName, subName].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[240px]">
                  <p className="text-xs text-muted-foreground truncate">
                    {outage.description || "No incident description recorded."}
                  </p>
                </TableCell>
                <TableCell>
                  <PriorityLabel priority={outage.priority} />
                </TableCell>
                <TableCell>
                  <StatusDot status={outage.status} showPulse />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {formatRelativeTime(outage.createdAt)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {outage.estimatedRestorationTime
                    ? formatDhakaDate(outage.estimatedRestorationTime)
                    : "Not scheduled"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(outage);
                    }}
                    aria-label={`View details for incident ${outage.id}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default OutagesTable;
