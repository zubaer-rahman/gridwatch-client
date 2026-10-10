"use client";

import { AlertCircle, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useUpdateUserDetails, useUpdateUserStatus } from "@/hooks/admin.hook";
import { useZones } from "@/hooks/grid.hook";
import type { AdminUser, Role } from "@/types";

interface EditUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditUserModal({
  user,
  isOpen,
  onClose,
}: EditUserModalProps) {
  const [role, setRole] = useState<Role>("OPERATOR");
  const [zoneId, setZoneId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const { data: zonesData } = useZones();
  const zones = zonesData?.data || [];

  const updateDetailsMutation = useUpdateUserDetails();
  const updateStatusMutation = useUpdateUserStatus();

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setZoneId(user.zoneId || "");
      setIsActive(user.isActive);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isSaving =
    updateDetailsMutation.isPending || updateStatusMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Update details (role & zone)
      await updateDetailsMutation.mutateAsync({
        id: user.id,
        payload: {
          role,
          zoneId: zoneId || undefined,
        },
      });

      // 2. Update status if changed
      if (isActive !== user.isActive) {
        if (user.role === "ADMIN" && !isActive) {
          toast.add({
            title: "Action Forbidden",
            description: "Cannot deactivate an Administrator account.",
            type: "error",
          });
          return;
        }

        await updateStatusMutation.mutateAsync({
          id: user.id,
          isActive,
        });
      }

      toast.add({
        title: "User Updated",
        description: `Successfully updated permissions and settings for ${user.name}.`,
        type: "success",
      });
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update user";
      toast.add({
        title: "Update Failed",
        description: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Edit User Permissions
              </h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg border border-border bg-muted/40">
            <div className="text-xs text-muted-foreground">User Identity</div>
            <div className="text-sm font-medium text-foreground">
              {user.name}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5">
              ID: {user.id}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-user-role">Assigned Role</Label>
            <select
              id="edit-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="OPERATOR">
                OPERATOR (Grid Operations & Dispatch)
              </option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
              <option value="CUSTOMER">CUSTOMER (Consumer)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-user-zone">Distribution Zone Assignment</Label>
            <select
              id="edit-user-zone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="">No Zone Assigned (National)</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-user-status">Account Access Status</Label>
            <select
              id="edit-user-status"
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              disabled={user.role === "ADMIN"}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="active">ACTIVE (Allowed to login)</option>
              <option value="inactive">SUSPENDED (Access revoked)</option>
            </select>
            {user.role === "ADMIN" && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                Administrator accounts cannot be disabled.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
