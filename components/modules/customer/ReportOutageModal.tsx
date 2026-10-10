"use client";

import { AlertTriangle, Flame, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useAreas } from "@/hooks/grid.hook";
import { useCreateReport } from "@/hooks/report.hook";
import { useUser } from "@/hooks/user.hook";

interface ReportOutageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAreaId?: string;
}

export default function ReportOutageModal({
  isOpen,
  onClose,
  defaultAreaId,
}: ReportOutageModalProps) {
  const { user } = useCurrentUser();
  const { data: fullUserData } = useUser(user?.userId || "");
  const profile = fullUserData?.data;

  const { data: areasData } = useAreas();
  const areas = areasData?.data || [];

  const [areaId, setAreaId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isPriority, setIsPriority] = useState(false);

  useEffect(() => {
    if (defaultAreaId) {
      setAreaId(defaultAreaId);
    } else if (profile?.areaId) {
      setAreaId(profile.areaId);
    } else if (areas.length > 0 && !areaId) {
      setAreaId(areas[0].id);
    }
  }, [defaultAreaId, profile, areas, areaId]);

  const createReportMutation = useCreateReport();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!areaId) {
      toast.add({
        title: "Area Required",
        description: "Please specify your distribution sector or area.",
        type: "error",
      });
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        areaId,
        description: description.trim() || undefined,
        isPriority,
      });

      toast.add({
        title: "Outage Report Submitted",
        description: isPriority
          ? "Priority incident ticket logged. Queued for fast-track dispatch."
          : "Your outage report has been recorded and merged into the sector monitor.",
        type: "success",
      });

      setDescription("");
      setIsPriority(false);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to submit outage report";
      toast.add({
        title: "Submission Error",
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
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Report Power Interruption
              </h2>
              <p className="text-xs text-muted-foreground">
                Log a real-time electrical disruption for your premise area
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
          <div className="space-y-1.5">
            <Label htmlFor="report-area">Premise Sector / Area *</Label>
            <select
              id="report-area"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select your local area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.feeder ? `(${a.feeder.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-desc">Description of Power Failure</Label>
            <Textarea
              id="report-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Complete blackout across the block, sparking transformer on road 12..."
            />
          </div>

          {/* Priority SLA Option */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="is-priority"
                checked={isPriority}
                onCheckedChange={(checked) => setIsPriority(Boolean(checked))}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="is-priority"
                  className="text-sm font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="h-4 w-4 text-amber-500" />
                  Request Priority SLA Response (৳200 fee)
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fast-tracks dispatch to the on-duty emergency crew. Eligible
                  for bKash verification and SLA resolution time tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createReportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReportMutation.isPending}
              className="gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>
                {createReportMutation.isPending
                  ? "Submitting..."
                  : "Submit Incident Report"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
