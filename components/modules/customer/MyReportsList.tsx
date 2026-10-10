"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Flame,
  MapPin,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useState } from "react";
import BkashPaymentModal from "@/components/modules/customer/BkashPaymentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyReports } from "@/hooks/report.hook";
import type { OutageReport } from "@/types";
import {
  formatBDT,
  formatDhakaDate,
  formatRelativeTime,
  getStatusLabel,
} from "@/utils/outage.utils";

interface MyReportsListProps {
  onOpenReportModal: () => void;
}

export default function MyReportsList({
  onOpenReportModal,
}: MyReportsListProps) {
  const [selectedReportForPayment, setSelectedReportForPayment] =
    useState<OutageReport | null>(null);

  const { data: reportsResponse, isLoading, isError, refetch } = useMyReports();

  const reports = reportsResponse?.data || [];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            My Incident Reports
          </h2>
          <p className="text-xs text-muted-foreground">
            Historical chronicle and real-time status of your premise reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Badge variant="outline" className="font-mono text-xs">
            {reports.length} Recorded
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border space-y-2"
            >
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center space-y-3">
          <AlertCircle className="h-7 w-7 text-destructive mx-auto" />
          <p className="text-sm font-semibold text-foreground">
            Failed to retrieve incident reports
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            No incident reports recorded
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your electrical premise has not filed any power disruptions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenReportModal}
            className="gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>File New Incident Report</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 divide-y divide-border">
          {reports.map((report) => {
            const outage = report.outage;
            const statusText = outage
              ? getStatusLabel(outage.status, true)
              : "Reported";

            const isRestored =
              outage?.status === "RESTORED" || outage?.status === "CLOSED";
            const isInProgress = outage?.status === "IN_PROGRESS";
            const isAssigned = outage?.status === "ASSIGNED";

            const statusColor = isRestored
              ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
              : isInProgress
                ? "border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400"
                : isAssigned
                  ? "border-sky-500/30 text-sky-600 bg-sky-500/10 dark:text-sky-400"
                  : "border-border text-muted-foreground bg-muted";

            return (
              <div
                key={report.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {report.description || "Power Disruption at Premise"}
                    </span>

                    {/* Priority Badge */}
                    {report.isPriority && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400">
                        <Flame className="h-3 w-3" />
                        Priority SLA
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusColor}`}
                    >
                      {isRestored && <CheckCircle2 className="h-3 w-3" />}
                      {statusText}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.area?.name || "Assigned Sector"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(report.createdAt)} (
                      {formatDhakaDate(report.createdAt)})
                    </span>
                  </div>

                  {/* Estimated Restoration Time if active */}
                  {outage?.estimatedRestorationTime && !isRestored && (
                    <div className="text-xs text-primary font-mono flex items-center gap-1.5 pt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>
                        Estimated Restoration:{" "}
                        {formatDhakaDate(outage.estimatedRestorationTime)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment or Status Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  {report.isPriority ? (
                    report.payment?.status === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        bKash Paid {formatBDT(report.payment.amount)}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedReportForPayment(report)}
                        className="h-7 px-2.5 text-xs bg-[#D12053] hover:bg-[#b01b45] text-white font-semibold gap-1 shadow-xs"
                      >
                        <CreditCard className="h-3 w-3" />
                        <span>Pay {formatBDT(200)} via bKash</span>
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReportForPayment(report)}
                      className="h-7 px-2 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-medium gap-1"
                    >
                      <Flame className="h-3 w-3 text-amber-500" />
                      <span>Upgrade Priority</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* bKash Payment Gateway Modal */}
      <BkashPaymentModal
        report={selectedReportForPayment}
        isOpen={Boolean(selectedReportForPayment)}
        onClose={() => setSelectedReportForPayment(null)}
      />
    </div>
  );
}
