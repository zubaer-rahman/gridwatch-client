"use client";

import { AlertTriangle, CheckCircle2, Flame, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import AreaStatusCard from "@/components/modules/customer/AreaStatusCard";
import MyReportsList from "@/components/modules/customer/MyReportsList";
import ReportOutageModal from "@/components/modules/customer/ReportOutageModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useMyReports } from "@/hooks/report.hook";
import { useUser } from "@/hooks/user.hook";

export default function CustomerPortalView() {
  const { user } = useCurrentUser();
  const { data: fullUserData } = useUser(user?.userId || "");
  const profile = fullUserData?.data;

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  useEffect(() => {
    if (profile?.areaId) {
      setSelectedAreaId(profile.areaId);
    }
  }, [profile?.areaId]);

  const { data: myReportsResponse } = useMyReports();
  const myReports = myReportsResponse?.data || [];

  const activeReportsCount = myReports.filter(
    (r) =>
      r.outage &&
      r.outage.status !== "RESTORED" &&
      r.outage.status !== "CLOSED",
  ).length;

  const resolvedReportsCount = myReports.filter(
    (r) =>
      r.outage &&
      (r.outage.status === "RESTORED" || r.outage.status === "CLOSED"),
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer Premise & Outage Center
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              CONSUMER PORTAL
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time power supply status, telemetry, and priority repair
            tracking for{" "}
            <span className="text-foreground font-medium">
              {profile?.name || user?.email || "Consumer"}
            </span>
          </p>
        </div>

        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="gap-2 self-start md:self-auto"
        >
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <span>Report Power Interruption</span>
        </Button>
      </div>

      {/* KPI / Consumer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Active Incidents
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {activeReportsCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Dispatches currently under field repair
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Resolved Tickets
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {resolvedReportsCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Lifetime restored power interruptions
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Contract Service Plan
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-bold tracking-tight text-foreground truncate">
            Standard & Priority SLA
          </div>
          <p className="text-xs text-muted-foreground">
            National Grid 24/7 Monitoring Enabled
          </p>
        </div>
      </div>

      {/* Real-time Premise & Area Supply Card */}
      <AreaStatusCard
        selectedAreaId={selectedAreaId}
        onSelectAreaId={(id) => setSelectedAreaId(id)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Incident Reports Chronicle */}
      <MyReportsList onOpenReportModal={() => setIsReportModalOpen(true)} />

      {/* Outage Reporting Modal */}
      <ReportOutageModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultAreaId={selectedAreaId}
      />
    </div>
  );
}
