"use client";

import { Shield, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useCreateInternalUser } from "@/hooks/admin.hook";
import { useZones } from "@/hooks/grid.hook";
import type { Role } from "@/types";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [role, setRole] = useState<Role>("OPERATOR");
  const [zoneId, setZoneId] = useState("");

  const { data: zonesData } = useZones();
  const zones = zonesData?.data || [];

  const createMutation = useCreateInternalUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.add({
        title: "Validation Error",
        description: "Name, email, and password are required.",
        type: "error",
      });
      return;
    }

    if (password.length < 6) {
      toast.add({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        contactNumber: contactNumber.trim() || undefined,
        role,
        zoneId: zoneId || undefined,
      });

      toast.add({
        title: "User Created",
        description: `Successfully provisioned ${role} account for ${name}.`,
        type: "success",
      });

      // Reset form and close
      setName("");
      setEmail("");
      setPassword("");
      setContactNumber("");
      setRole("OPERATOR");
      setZoneId("");
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create user";
      toast.add({
        title: "Provisioning Failed",
        description: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Provision System User
              </h2>
              <p className="text-xs text-muted-foreground">
                Create new administrative, operator, or customer principal
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name *</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engr. Tanvir Ahmed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email Address *</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanvir.ahmed@gridwatch.bd"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-password">Initial Password *</Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-contact">Contact Number</Label>
              <Input
                id="user-contact"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+880 1711 000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-role">Role Authorization *</Label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="OPERATOR">OPERATOR (Grid Dispatcher)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
                <option value="CUSTOMER">CUSTOMER (Consumer)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-zone">Distribution Zone</Label>
              <select
                id="user-zone"
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
          </div>

          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              RBAC authorization is enforced immediately. Operators will have
              access to the dispatch console and grid hierarchy.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
