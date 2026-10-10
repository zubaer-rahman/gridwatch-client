"use client";

import { CalendarClock, MapPin, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useAreas,
  useFeeders,
  useSubstations,
  useZones,
} from "@/hooks/grid.hook";
import { useCreateSchedule } from "@/hooks/schedule.hook";

export default function CreateScheduleModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("log") === "true";

  // Cascading grid hierarchy selections
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedSubstationId, setSelectedSubstationId] = useState<string>("");
  const [selectedFeederId, setSelectedFeederId] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // Grid hierarchy queries
  const { data: zonesData, isLoading: isLoadingZones } = useZones();
  const { data: substationsData, isLoading: isLoadingSubstations } =
    useSubstations();
  const { data: feedersData, isLoading: isLoadingFeeders } = useFeeders();
  const { data: areasData, isLoading: isLoadingAreas } = useAreas();

  const zones = zonesData?.data || [];
  const allSubstations = substationsData?.data || [];
  const allFeeders = feedersData?.data || [];
  const allAreas = areasData?.data || [];

  // Filter downstream items based on parent selections
  const filteredSubstations = useMemo(() => {
    if (!selectedZoneId) return allSubstations;
    return allSubstations.filter((s) => s.zoneId === selectedZoneId);
  }, [allSubstations, selectedZoneId]);

  const filteredFeeders = useMemo(() => {
    if (!selectedSubstationId) return allFeeders;
    return allFeeders.filter((f) => f.substationId === selectedSubstationId);
  }, [allFeeders, selectedSubstationId]);

  const filteredAreas = useMemo(() => {
    if (!selectedFeederId) return allAreas;
    return allAreas.filter((a) => a.feederId === selectedFeederId);
  }, [allAreas, selectedFeederId]);

  const createScheduleMutation = useCreateSchedule();

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("log");
    router.push(`?${params.toString()}`);
  };

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setSelectedSubstationId("");
    setSelectedFeederId("");
    setSelectedAreaId("");
  };

  const handleSubstationChange = (substationId: string) => {
    setSelectedSubstationId(substationId);
    setSelectedFeederId("");
    setSelectedAreaId("");
  };

  const handleFeederChange = (feederId: string) => {
    setSelectedFeederId(feederId);
    setSelectedAreaId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAreaId) {
      toast.add({
        title: "Area Required",
        description:
          "Please select an affected delivery area for this schedule.",
        type: "error",
      });
      return;
    }

    if (!startsAt || !endsAt) {
      toast.add({
        title: "Dates Required",
        description: "Please enter both start and end timestamps.",
        type: "error",
      });
      return;
    }

    const startMs = new Date(startsAt).getTime();
    const endMs = new Date(endsAt).getTime();

    if (startMs >= endMs) {
      toast.add({
        title: "Invalid Window",
        description: "End time must be after start time.",
        type: "error",
      });
      return;
    }

    try {
      await createScheduleMutation.mutateAsync({
        areaId: selectedAreaId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        reason: reason.trim() || undefined,
      });

      toast.add({
        title: "Maintenance Scheduled",
        description:
          "Maintenance window scheduled and broadcast to area consumers.",
        type: "success",
      });

      handleClose();
      // Reset form
      setSelectedZoneId("");
      setSelectedSubstationId("");
      setSelectedFeederId("");
      setSelectedAreaId("");
      setStartsAt("");
      setEndsAt("");
      setReason("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create schedule";
      toast.add({
        title: "Scheduling Conflict",
        description: message,
        type: "error",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Schedule Maintenance Window
              </h2>
              <p className="text-xs text-muted-foreground">
                Broadcast load shedding or preventive outage to consumers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Cascading Location Hierarchy */}
          <div className="space-y-2 rounded-xl bg-muted/40 p-3 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
              <span>Target Grid Infrastructure</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">
                  1. Zone
                </label>
                <Select
                  value={selectedZoneId}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  disabled={isLoadingZones}
                  className="h-8 text-xs"
                >
                  <option value="">Select Zone...</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">
                  2. Substation
                </label>
                <Select
                  value={selectedSubstationId}
                  onChange={(e) => handleSubstationChange(e.target.value)}
                  disabled={!selectedZoneId || isLoadingSubstations}
                  className="h-8 text-xs"
                >
                  <option value="">Select Substation...</option>
                  {filteredSubstations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">
                  3. Feeder Line
                </label>
                <Select
                  value={selectedFeederId}
                  onChange={(e) => handleFeederChange(e.target.value)}
                  disabled={!selectedSubstationId || isLoadingFeeders}
                  className="h-8 text-xs"
                >
                  <option value="">Select Feeder...</option>
                  {filteredFeeders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block font-semibold text-foreground">
                  4. Delivery Area *
                </label>
                <Select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  disabled={!selectedFeederId || isLoadingAreas}
                  className="h-8 text-xs border-amber-500/40"
                >
                  <option value="">Select Area...</option>
                  {filteredAreas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Time Window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Starts At *
              </label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Ends At *
              </label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Reason Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Purpose & Reason
            </label>
            <Textarea
              placeholder="e.g., Feeder transformer overhaul, busbar tightening, load shedding..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={createScheduleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createScheduleMutation.isPending}
              className="bg-amber-500 font-medium text-black hover:bg-amber-400 gap-1.5"
            >
              {createScheduleMutation.isPending ? (
                <span>Scheduling...</span>
              ) : (
                <>
                  <CalendarClock className="h-4 w-4" />
                  <span>Confirm Schedule</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
