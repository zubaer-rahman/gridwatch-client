"use client";

import { Check, Mail, Phone, UserCheck, X, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import PriorityLabel from "@/components/modules/outages/PriorityLabel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateAssignment } from "@/hooks/assignment.hook";
import { useOutage } from "@/hooks/outage.hook";
import { useUsers } from "@/hooks/user.hook";

export default function AssignModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignOutageId = searchParams.get("assign");

  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Fetch outage being assigned
  const { data: outageData, isLoading: isLoadingOutage } = useOutage(
    assignOutageId || "",
  );
  const outage = outageData?.data;

  // Fetch real OPERATOR users
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    role: "OPERATOR",
  });
  const operators = (usersData?.data || []).filter((u) => u.isActive);

  const createAssignmentMutation = useCreateAssignment();

  if (!assignOutageId) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("assign");
    router.push(`?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperatorId) {
      toast.add({
        title: "Operator Required",
        description: "Please select an operator to dispatch for this outage.",
        type: "error",
      });
      return;
    }

    try {
      await createAssignmentMutation.mutateAsync({
        outageId: assignOutageId,
        operatorId: selectedOperatorId,
        notes: notes.trim() || undefined,
      });

      toast.add({
        title: "Operator Dispatched",
        description: "Field operator assigned successfully to incident.",
        type: "success",
      });

      handleClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to assign operator";
      toast.add({
        title: "Assignment Failed",
        description: message,
        type: "error",
      });
    }
  };

  const incidentCode = outage?.id.slice(0, 8).toUpperCase() || "";
  const locationLabel =
    outage?.area?.name ||
    outage?.area?.feeder?.name ||
    "Selected Distribution Sector";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Dispatch Assignment
              </h2>
              <p className="text-xs text-muted-foreground">
                Assign an active field operator to resolve incident
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Outage Summary Card */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border flex flex-col gap-1.5">
            {isLoadingOutage ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : outage ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    #{incidentCode} • {locationLabel}
                  </span>
                  <PriorityLabel priority={outage.priority} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {outage.description || "Active feeder outage reported."}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/50 mt-1">
                  <span>
                    Substation: {outage.area?.feeder?.substation?.name || "N/A"}
                  </span>
                  <span>•</span>
                  <span>
                    Feeder: {outage.area?.feeder?.name || "Main Distribution"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Outage incident not found.
              </p>
            )}
          </div>

          {/* Operator Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Field Operator
              </label>
              <span className="text-xs font-mono text-muted-foreground">
                {operators.length} available
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {isLoadingUsers ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : operators.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No active operators registered in system.
                </div>
              ) : (
                operators.map((op) => {
                  const isSelected = selectedOperatorId === op.id;

                  return (
                    <div
                      key={op.id}
                      onClick={() => setSelectedOperatorId(op.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                          : "border-border hover:bg-muted/50 bg-card"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {op.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {op.email}
                          </span>
                          {op.contactNumber && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3" />
                              {op.contactNumber}
                            </span>
                          )}
                        </div>
                        {op.zone && (
                          <span className="text-[10px] text-muted-foreground/80">
                            Zone: {op.zone.name}
                          </span>
                        )}
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-amber-500 bg-amber-500 text-black"
                            : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dispatch Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dispatch Instructions / Notes (Optional)
            </label>
            <Textarea
              placeholder="e.g. Inspect relay BK-410 and measure phase voltage before reconnection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[72px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                !selectedOperatorId || createAssignmentMutation.isPending
              }
              className="text-xs bg-amber-500 text-black hover:bg-amber-400 font-semibold gap-1.5"
            >
              <UserCheck className="h-4 w-4" />
              <span>
                {createAssignmentMutation.isPending
                  ? "Dispatching..."
                  : "Dispatch Operator"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
