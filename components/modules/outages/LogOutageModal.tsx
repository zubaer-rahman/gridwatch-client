"use client";

import { AlertTriangle, MapPin, X } from "lucide-react";
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
import { useCreateOutage } from "@/hooks/outage.hook";
import type { Priority } from "@/types";

export default function LogOutageModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("log") === "true";

  // Cascading grid hierarchy selections
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedSubstationId, setSelectedSubstationId] = useState<string>("");
  const [selectedFeederId, setSelectedFeederId] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  const [priority, setPriority] = useState<Priority>("HIGH");
  const [description, setDescription] = useState<string>("");
  const [estimatedRestorationTime, setEstimatedRestorationTime] =
    useState<string>("");

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

  const createOutageMutation = useCreateOutage();

  if (!isOpen) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("log");
    router.push(`?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) {
      toast.add({
        title: "Area Required",
        description: "Please select an affected distribution area.",
        type: "error",
      });
      return;
    }

    try {
      const isoEta = estimatedRestorationTime
        ? new Date(estimatedRestorationTime).toISOString()
        : undefined;

      await createOutageMutation.mutateAsync({
        areaId: selectedAreaId,
        priority,
        description: description.trim() || undefined,
        estimatedRestorationTime: isoEta,
      });

      toast.add({
        title: "Incident Logged",
        description: "Outage reported and queued into grid operations.",
        type: "success",
      });

      handleClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to log outage incident";
      toast.add({
        title: "Logging Failed",
        description: message,
        type: "error",
      });
    }
  };

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
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Log Grid Outage
              </h2>
              <p className="text-xs text-muted-foreground">
                Register a new power distribution failure in the national queue
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

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Cascading Grid Selectors */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
              <span>Grid Network Hierarchy</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Zone */}
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                  1. Zone
                </label>
                <Select
                  value={selectedZoneId}
                  onChange={(e) => {
                    setSelectedZoneId(e.target.value);
                    setSelectedSubstationId("");
                    setSelectedFeederId("");
                    setSelectedAreaId("");
                  }}
                  className="h-9 text-xs"
                  disabled={isLoadingZones}
                >
                  <option value="">All Zones</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Substation */}
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                  2. Substation
                </label>
                <Select
                  value={selectedSubstationId}
                  onChange={(e) => {
                    setSelectedSubstationId(e.target.value);
                    setSelectedFeederId("");
                    setSelectedAreaId("");
                  }}
                  className="h-9 text-xs"
                  disabled={isLoadingSubstations}
                >
                  <option value="">Select Substation</option>
                  {filteredSubstations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Feeder */}
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                  3. Feeder Line
                </label>
                <Select
                  value={selectedFeederId}
                  onChange={(e) => {
                    setSelectedFeederId(e.target.value);
                    setSelectedAreaId("");
                  }}
                  className="h-9 text-xs"
                  disabled={isLoadingFeeders}
                >
                  <option value="">Select Feeder</option>
                  {filteredFeeders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Area */}
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                  4. Affected Area *
                </label>
                <Select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="h-9 text-xs border-amber-500/40"
                  disabled={isLoadingAreas}
                >
                  <option value="">Select Area Sector</option>
                  {filteredAreas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Priority & Estimated Restoration Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                Priority Rating *
              </label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-9 text-xs"
              >
                <option value="HIGH">High (Immediate Response)</option>
                <option value="MEDIUM">Medium (Standard Dispatch)</option>
                <option value="LOW">Low (Scheduled Maintenance)</option>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1">
                Estimated Restoration (ETA)
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={estimatedRestorationTime}
                  onChange={(e) => setEstimatedRestorationTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Description / Diagnostics */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-muted-foreground block">
              Incident Diagnostics / Notes
            </label>
            <Textarea
              rows={3}
              placeholder="e.g. Transient line fault triggered circuit breaker BK-201. Heavy rain and high wind reported in sector."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
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
              disabled={!selectedAreaId || createOutageMutation.isPending}
              className="text-xs bg-red-600 text-white hover:bg-red-500 font-semibold gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>
                {createOutageMutation.isPending
                  ? "Submitting..."
                  : "Submit Outage"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
