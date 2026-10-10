"use client";

import {
  Building2,
  Edit2,
  Layers,
  MapPin,
  Plus,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useAreas,
  useCreateArea,
  useCreateFeeder,
  useCreateSubstation,
  useCreateZone,
  useDeleteArea,
  useDeleteFeeder,
  useDeleteSubstation,
  useDeleteZone,
  useFeeders,
  useSubstations,
  useUpdateArea,
  useUpdateFeeder,
  useUpdateSubstation,
  useUpdateZone,
  useZones,
} from "@/hooks/grid.hook";
import type { Area, DistributionZone, Feeder, Substation } from "@/types";

type ModalMode =
  | "ADD_ZONE"
  | "EDIT_ZONE"
  | "ADD_SUB"
  | "EDIT_SUB"
  | "ADD_FEEDER"
  | "EDIT_FEEDER"
  | "ADD_AREA"
  | "EDIT_AREA"
  | null;

export default function GridNetworkView() {
  // Selected hierarchy drilldown
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedSubstationId, setSelectedSubstationId] = useState<string>("");
  const [selectedFeederId, setSelectedFeederId] = useState<string>("");

  // Modal State
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [activeEditingId, setActiveEditingId] = useState<string>("");

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "ZONE" | "SUB" | "FEEDER" | "AREA";
    id: string;
    name: string;
  } | null>(null);

  // Queries
  const { data: zonesData, isLoading: isLoadingZones } = useZones();
  const { data: subsData, isLoading: isLoadingSubs } = useSubstations(
    selectedZoneId ? { zoneId: selectedZoneId } : undefined,
  );
  const { data: feedersData, isLoading: isLoadingFeeders } = useFeeders(
    selectedSubstationId ? { substationId: selectedSubstationId } : undefined,
  );
  const { data: areasData, isLoading: isLoadingAreas } = useAreas(
    selectedFeederId ? { feederId: selectedFeederId } : undefined,
  );

  const zones: DistributionZone[] = zonesData?.data || [];
  const substations: Substation[] = subsData?.data || [];
  const feeders: Feeder[] = feedersData?.data || [];
  const areas: Area[] = areasData?.data || [];

  // Auto-select first zone if available and not selected
  const activeZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) || zones[0];
  }, [zones, selectedZoneId]);

  // Mutations
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();

  const createSubMutation = useCreateSubstation();
  const updateSubMutation = useUpdateSubstation();
  const deleteSubMutation = useDeleteSubstation();

  const createFeederMutation = useCreateFeeder();
  const updateFeederMutation = useUpdateFeeder();
  const deleteFeederMutation = useDeleteFeeder();

  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();

  const isSaving =
    createZoneMutation.isPending ||
    updateZoneMutation.isPending ||
    createSubMutation.isPending ||
    updateSubMutation.isPending ||
    createFeederMutation.isPending ||
    updateFeederMutation.isPending ||
    createAreaMutation.isPending ||
    updateAreaMutation.isPending;

  const isDeleting =
    deleteZoneMutation.isPending ||
    deleteSubMutation.isPending ||
    deleteFeederMutation.isPending ||
    deleteAreaMutation.isPending;

  const handleOpenAddZone = () => {
    setFormName("");
    setFormDesc("");
    setModalMode("ADD_ZONE");
  };

  const handleOpenEditZone = (zone: DistributionZone) => {
    setActiveEditingId(zone.id);
    setFormName(zone.name);
    setFormDesc(zone.description || "");
    setModalMode("EDIT_ZONE");
  };

  const handleOpenAddSub = () => {
    setFormName("");
    setModalMode("ADD_SUB");
  };

  const handleOpenEditSub = (sub: Substation) => {
    setActiveEditingId(sub.id);
    setFormName(sub.name);
    setModalMode("EDIT_SUB");
  };

  const handleOpenAddFeeder = () => {
    setFormName("");
    setModalMode("ADD_FEEDER");
  };

  const handleOpenEditFeeder = (feeder: Feeder) => {
    setActiveEditingId(feeder.id);
    setFormName(feeder.name);
    setModalMode("EDIT_FEEDER");
  };

  const handleOpenAddArea = () => {
    setFormName("");
    setModalMode("ADD_AREA");
  };

  const handleOpenEditArea = (area: Area) => {
    setActiveEditingId(area.id);
    setFormName(area.name);
    setModalMode("EDIT_AREA");
  };

  const closeModal = () => {
    setModalMode(null);
    setFormName("");
    setFormDesc("");
    setActiveEditingId("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.add({
        title: "Name Required",
        description: "Please enter an infrastructure entity name.",
        type: "error",
      });
      return;
    }

    try {
      if (modalMode === "ADD_ZONE") {
        await createZoneMutation.mutateAsync({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });
        toast.add({
          title: "Zone Created",
          description: `Distribution zone ${formName} registered.`,
          type: "success",
        });
      } else if (modalMode === "EDIT_ZONE") {
        await updateZoneMutation.mutateAsync({
          id: activeEditingId,
          payload: {
            name: formName.trim(),
            description: formDesc.trim() || undefined,
          },
        });
        toast.add({
          title: "Zone Updated",
          description: "Zone parameters modified successfully.",
          type: "success",
        });
      } else if (modalMode === "ADD_SUB") {
        const zoneId = selectedZoneId || activeZone?.id;
        if (!zoneId) {
          toast.add({
            title: "Parent Zone Required",
            description: "Please select a zone before creating a substation.",
            type: "error",
          });
          return;
        }
        await createSubMutation.mutateAsync({
          name: formName.trim(),
          zoneId,
        });
        toast.add({
          title: "Substation Created",
          description: `Substation ${formName} added to zone.`,
          type: "success",
        });
      } else if (modalMode === "EDIT_SUB") {
        await updateSubMutation.mutateAsync({
          id: activeEditingId,
          payload: { name: formName.trim() },
        });
        toast.add({
          title: "Substation Updated",
          description: "Substation details updated.",
          type: "success",
        });
      } else if (modalMode === "ADD_FEEDER") {
        if (!selectedSubstationId) {
          toast.add({
            title: "Parent Substation Required",
            description: "Please select a substation before adding a feeder.",
            type: "error",
          });
          return;
        }
        await createFeederMutation.mutateAsync({
          name: formName.trim(),
          substationId: selectedSubstationId,
        });
        toast.add({
          title: "Feeder Created",
          description: `Distribution feeder ${formName} configured.`,
          type: "success",
        });
      } else if (modalMode === "EDIT_FEEDER") {
        await updateFeederMutation.mutateAsync({
          id: activeEditingId,
          payload: { name: formName.trim() },
        });
        toast.add({
          title: "Feeder Updated",
          description: "Feeder parameters updated.",
          type: "success",
        });
      } else if (modalMode === "ADD_AREA") {
        if (!selectedFeederId) {
          toast.add({
            title: "Parent Feeder Required",
            description: "Please select a feeder line before adding an area.",
            type: "error",
          });
          return;
        }
        await createAreaMutation.mutateAsync({
          name: formName.trim(),
          feederId: selectedFeederId,
        });
        toast.add({
          title: "Area Registered",
          description: `Consumer area ${formName} mapped to feeder.`,
          type: "success",
        });
      } else if (modalMode === "EDIT_AREA") {
        await updateAreaMutation.mutateAsync({
          id: activeEditingId,
          payload: { name: formName.trim() },
        });
        toast.add({
          title: "Area Updated",
          description: "Area properties saved.",
          type: "success",
        });
      }
      closeModal();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save grid changes";
      toast.add({
        title: "Action Failed",
        description: message,
        type: "error",
      });
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "ZONE") {
        await deleteZoneMutation.mutateAsync(deleteConfirm.id);
        if (selectedZoneId === deleteConfirm.id) setSelectedZoneId("");
      } else if (deleteConfirm.type === "SUB") {
        await deleteSubMutation.mutateAsync(deleteConfirm.id);
        if (selectedSubstationId === deleteConfirm.id)
          setSelectedSubstationId("");
      } else if (deleteConfirm.type === "FEEDER") {
        await deleteFeederMutation.mutateAsync(deleteConfirm.id);
        if (selectedFeederId === deleteConfirm.id) setSelectedFeederId("");
      } else if (deleteConfirm.type === "AREA") {
        await deleteAreaMutation.mutateAsync(deleteConfirm.id);
      }
      toast.add({
        title: "Entity Deleted",
        description: `${deleteConfirm.name} removed from infrastructure database.`,
        type: "success",
      });
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Cannot delete parent entity that has attached children or active incidents";
      toast.add({
        title: "Deletion Prevented",
        description: message,
        type: "error",
      });
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Grid Network Infrastructure
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            4-Level National Power Distribution Topology: Zones → Substations →
            Feeders → Areas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenAddZone}
            className="text-xs bg-amber-500 text-black hover:bg-amber-400 font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Distribution Zone</span>
          </Button>
        </div>
      </div>

      {/* 4-Column Progressive Grid Hierarchy Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {/* Level 1: Zones */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Zones ({zones.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenAddZone}
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Add Zone"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-2 divide-y divide-border/60 overflow-y-auto flex-1">
            {isLoadingZones ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : zones.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No distribution zones configured.
              </div>
            ) : (
              zones.map((zone) => {
                const isSelected =
                  (selectedZoneId || activeZone?.id) === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setSelectedSubstationId("");
                      setSelectedFeederId("");
                    }}
                    className={`group p-2.5 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border border-amber-500/30 text-foreground font-semibold"
                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{zone.name}</div>
                      {zone.description && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {zone.description}
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEditZone(zone)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "ZONE",
                            id: zone.id,
                            name: zone.name,
                          })
                        }
                        className="p-1 text-red-500 hover:text-red-400 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Level 2: Substations */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                2. Substations ({substations.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenAddSub}
              disabled={!activeZone}
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Add Substation"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-2 divide-y divide-border/60 overflow-y-auto flex-1">
            {isLoadingSubs ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : substations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No substations attached to selected zone.
              </div>
            ) : (
              substations.map((sub) => {
                const isSelected = selectedSubstationId === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubstationId(sub.id);
                      setSelectedFeederId("");
                    }}
                    className={`group p-2.5 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-500/10 border border-blue-500/30 text-foreground font-semibold"
                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{sub.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        33/11kV Node
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEditSub(sub)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "SUB",
                            id: sub.id,
                            name: sub.name,
                          })
                        }
                        className="p-1 text-red-500 hover:text-red-400 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Level 3: Feeders */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                3. Feeders ({feeders.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenAddFeeder}
              disabled={!selectedSubstationId}
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Add Feeder"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-2 divide-y divide-border/60 overflow-y-auto flex-1">
            {!selectedSubstationId ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Select a substation to view feeder lines.
              </div>
            ) : isLoadingFeeders ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : feeders.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No 11kV feeders configured for this substation.
              </div>
            ) : (
              feeders.map((feeder) => {
                const isSelected = selectedFeederId === feeder.id;

                return (
                  <div
                    key={feeder.id}
                    onClick={() => setSelectedFeederId(feeder.id)}
                    className={`group p-2.5 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/10 border border-purple-500/30 text-foreground font-semibold"
                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{feeder.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        11kV Distribution Line
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEditFeeder(feeder)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "FEEDER",
                            id: feeder.id,
                            name: feeder.name,
                          })
                        }
                        className="p-1 text-red-500 hover:text-red-400 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Level 4: Areas */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                4. Areas ({areas.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenAddArea}
              disabled={!selectedFeederId}
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Add Area"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-2 divide-y divide-border/60 overflow-y-auto flex-1">
            {!selectedFeederId ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Select a feeder to view mapped areas.
              </div>
            ) : isLoadingAreas ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : areas.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No consumer areas registered under this feeder line.
              </div>
            ) : (
              areas.map((area) => {
                return (
                  <div
                    key={area.id}
                    className="group p-2.5 rounded-lg flex items-center justify-between gap-2 hover:bg-muted/40 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-foreground truncate">
                        {area.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Consumer Delivery Sector
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => handleOpenEditArea(area)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: "AREA",
                            id: area.id,
                            name: area.name,
                          })
                        }
                        className="p-1 text-red-500 hover:text-red-400 rounded cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Entity Modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {modalMode === "ADD_ZONE" && "Add Distribution Zone"}
                {modalMode === "EDIT_ZONE" && "Edit Distribution Zone"}
                {modalMode === "ADD_SUB" && "Add Substation"}
                {modalMode === "EDIT_SUB" && "Edit Substation"}
                {modalMode === "ADD_FEEDER" && "Add Feeder Line"}
                {modalMode === "EDIT_FEEDER" && "Edit Feeder Line"}
                {modalMode === "ADD_AREA" && "Add Consumer Area"}
                {modalMode === "EDIT_AREA" && "Edit Consumer Area"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="p-5 flex flex-col gap-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Entity Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Dhaka North, Uttara 33kV Sub, Feeder-01..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {(modalMode === "ADD_ZONE" || modalMode === "EDIT_ZONE") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description (Optional)
                  </label>
                  <Textarea
                    placeholder="Sector coverage notes..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="text-xs min-h-[72px]"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="text-xs bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-foreground">
                Confirm Deletion
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-foreground">
                  {deleteConfirm.name}
                </span>
                ?
              </p>
              <p className="text-[11px] text-amber-500 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                Note: Deletion will be rejected by backend integrity rules if
                this entity has dependent child substations, feeders, areas, or
                active outages.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={executeDelete}
                className="text-xs bg-red-600 text-white hover:bg-red-500 font-semibold"
              >
                {isDeleting ? "Deleting..." : "Delete Entity"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
