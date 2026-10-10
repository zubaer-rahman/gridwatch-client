"use client";

import {
  AlertCircle,
  Filter,
  Plus,
  Search,
  Settings,
  Shield,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useState } from "react";
import CreateUserModal from "@/components/modules/admin/CreateUserModal";
import EditUserModal from "@/components/modules/admin/EditUserModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/admin.hook";
import { useDebounce } from "@/hooks/use-debounce";
import { extractDataArray, extractMeta } from "@/lib/utils";
import type { AdminUser, Role } from "@/types";
import { formatDhakaDate } from "@/utils/outage.utils";

export default function UsersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<AdminUser | null>(null);

  const queryParams = {
    search: debouncedSearch || undefined,
    role: roleFilter !== "ALL" ? (roleFilter as Role) : undefined,
    status:
      statusFilter !== "ALL"
        ? (statusFilter as "ACTIVE" | "INACTIVE")
        : undefined,
    page,
    limit,
  };

  const {
    data: usersResponse,
    isLoading,
    isError,
    refetch,
  } = useAdminUsers(queryParams);
  const users = extractDataArray<AdminUser>(usersResponse?.data);
  const meta = extractMeta(usersResponse?.data) || usersResponse?.meta;
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1;

  const updateStatusMutation = useUpdateUserStatus();

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.role === "ADMIN") {
      toast.add({
        title: "Action Forbidden",
        description: "Cannot alter status of an Administrator principal.",
        type: "error",
      });
      return;
    }

    const nextStatus = !user.isActive;
    try {
      await updateStatusMutation.mutateAsync({
        id: user.id,
        isActive: nextStatus,
      });

      toast.add({
        title: nextStatus ? "User Activated" : "User Suspended",
        description: `${user.name} is now ${nextStatus ? "active" : "suspended"}.`,
        type: "success",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to change user status";
      toast.add({
        title: "Action Failed",
        description: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Directory & RBAC
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              GOVERNANCE
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Role-based authorization, identity provisioning, and access
            lifecycle
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Provision User</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or principal..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OPERATOR">OPERATOR</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              Failed to load user directory
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Could not retrieve administrative user records from the server.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              No matching principals found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search criteria, role filters, or provision a
              new system user.
            </p>
            {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
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
                  <th className="py-3 px-4">Principal Identity</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Zone / Sector</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Provisioned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const roleColor =
                    u.role === "ADMIN"
                      ? "border-destructive/30 text-destructive bg-destructive/10"
                      : u.role === "OPERATOR"
                        ? "border-primary/30 text-primary bg-primary/10"
                        : "border-border text-muted-foreground bg-muted";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {u.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {u.contactNumber || "—"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${roleColor}`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {u.zone?.name || "National / Unassigned"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
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

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDhakaDate(u.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedUserForEdit(u)}
                          >
                            <Settings className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              u.role === "ADMIN" ||
                              updateStatusMutation.isPending
                            }
                            onClick={() => handleToggleStatus(u)}
                            className={`h-8 px-2 text-xs ${
                              u.isActive
                                ? "text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            }`}
                            title={
                              u.role === "ADMIN"
                                ? "Administrator cannot be suspended"
                                : undefined
                            }
                          >
                            {u.isActive ? (
                              <>
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
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
              ({meta.total} total principals)
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

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditUserModal
        user={selectedUserForEdit}
        isOpen={!!selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
      />
    </div>
  );
}
