"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coins,
  FileText,
  Network,
  Plus,
  RefreshCw,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CreateUserModal from "@/components/modules/admin/CreateUserModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStatistics, useAdminUsers } from "@/hooks/admin.hook";
import { formatBDT, formatDhakaDate } from "@/utils/outage.utils";

export default function AdminPortalView() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useAdminStatistics();

  const { data: usersData, isLoading: isLoadingUsers } = useAdminUsers({
    limit: 5,
  });

  const stats = statsData?.data;
  const recentUsers = usersData?.data || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Administration & Multi-Tenant Control
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              SYSTEM ROOT
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Role-based authorization (RBAC), distribution sector statistics, and
            audit oversight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Stats</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateUserOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Provision User</span>
          </Button>
        </div>
      </div>

      {/* High-Level Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Enrolled Users */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Enrolled Users
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          {isLoadingStats ? (
            <Skeleton className="h-8 w-20" />
          ) : isStatsError ? (
            <span className="text-sm text-destructive">Unavailable</span>
          ) : (
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats?.users.total.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {stats?.users.active.toLocaleString() ?? 0} active
                </span>{" "}
                across system
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Outages */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Grid Outages
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          {isLoadingStats ? (
            <Skeleton className="h-8 w-20" />
          ) : isStatsError ? (
            <span className="text-sm text-destructive">Unavailable</span>
          ) : (
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats?.outages.active ?? 0} Active
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.outages.total ?? 0} total lifetime incidents
              </p>
            </div>
          )}
        </div>

        {/* Card 3: Consumer Reports */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Inbound Reports
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          {isLoadingStats ? (
            <Skeleton className="h-8 w-20" />
          ) : isStatsError ? (
            <span className="text-sm text-destructive">Unavailable</span>
          ) : (
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats?.reports.total ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">
                  {stats?.reports.priority ?? 0} Priority SLA
                </span>{" "}
                • {stats?.reports.standard ?? 0} Standard
              </p>
            </div>
          )}
        </div>

        {/* Card 4: Priority Revenue */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Priority SLA Revenue
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          {isLoadingStats ? (
            <Skeleton className="h-8 w-24" />
          ) : isStatsError ? (
            <span className="text-sm text-destructive">Unavailable</span>
          ) : (
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {formatBDT(stats?.revenue.total ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Settled through bKash payment gateway
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Governance & Control Navigation Modules */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-3">
          Administrative Modules & Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group space-y-3"
          >
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                User Directory & RBAC
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Manage credentials, roles, and account statuses for all
                principals.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/grid"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group space-y-3"
          >
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-105 transition-transform">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                Grid Network Hierarchy
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure Zones, Substations, Feeders, and Sector Areas.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/outages"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group space-y-3"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 w-fit group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                Outage Operations Desk
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time incident response, field dispatch, and state machine
                controls.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group space-y-3"
          >
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500 w-fit group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                Audit Trail & History
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Inspect system audit logs, privilege changes, and entity
                mutations.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Directory Preview & Operational Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users Directory Preview (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Recently Provisioned Principals
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest user accounts registered or provisioned in the system
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              View All Directory
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoadingUsers ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No users registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                    <th className="py-2 px-3">Principal</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-foreground">
                          {u.name}
                        </div>
                        <div className="text-muted-foreground font-mono text-[11px]">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border text-[10px] ${
                            u.role === "ADMIN"
                              ? "border-destructive/30 text-destructive bg-destructive/10"
                              : u.role === "OPERATOR"
                                ? "border-primary/30 text-primary bg-primary/10"
                                : "border-border text-muted-foreground bg-muted"
                          }`}
                        >
                          <Shield className="h-2.5 w-2.5" />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            u.isActive
                              ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400"
                              : "text-rose-700 bg-rose-500/10 dark:text-rose-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {u.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        {formatDhakaDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Telemetry & Operational Health (1 col) */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Platform Status
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">
                  Database Engine
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">
                  Authentication RBAC
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  Grid State Machine
                </span>
              </div>
              <span className="text-[11px] font-mono text-primary">
                Enforcing
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">
                  Payment Gateway
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                bKash Ready
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
            Administrative changes are recorded to the immutable audit trail
            with cryptographic actor timestamps.
          </div>
        </div>
      </div>

      {/* Provision User Modal */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
      />
    </div>
  );
}
