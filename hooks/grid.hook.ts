"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArea,
  createFeeder,
  createSubstation,
  createZone,
  deleteArea,
  deleteFeeder,
  deleteSubstation,
  deleteZone,
  getAreaById,
  getAreas,
  getFeederById,
  getFeeders,
  getSubstationById,
  getSubstations,
  getZoneById,
  getZones,
  updateArea,
  updateFeeder,
  updateSubstation,
  updateZone,
} from "@/api/grid.api";
import type {
  CreateAreaPayload,
  CreateFeederPayload,
  CreateSubstationPayload,
  CreateZonePayload,
  UpdateAreaPayload,
  UpdateFeederPayload,
  UpdateSubstationPayload,
  UpdateZonePayload,
} from "@/types";

/* Zones Hooks */
export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });
}

export function useZone(id: string) {
  return useQuery({
    queryKey: ["zones", id],
    queryFn: () => getZoneById(id),
    enabled: !!id,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateZonePayload) => createZone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateZonePayload }) =>
      updateZone(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones", id] });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}

/* Substations Hooks */
export function useSubstations(params?: { zoneId?: string }) {
  return useQuery({
    queryKey: ["substations", params],
    queryFn: () => getSubstations(params),
  });
}

export function useSubstation(id: string) {
  return useQuery({
    queryKey: ["substations", id],
    queryFn: () => getSubstationById(id),
    enabled: !!id,
  });
}

export function useCreateSubstation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubstationPayload) => createSubstation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["substations"] });
    },
  });
}

export function useUpdateSubstation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSubstationPayload;
    }) => updateSubstation(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["substations"] });
      queryClient.invalidateQueries({ queryKey: ["substations", id] });
    },
  });
}

export function useDeleteSubstation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubstation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["substations"] });
    },
  });
}

/* Feeders Hooks */
export function useFeeders(params?: { substationId?: string }) {
  return useQuery({
    queryKey: ["feeders", params],
    queryFn: () => getFeeders(params),
  });
}

export function useFeeder(id: string) {
  return useQuery({
    queryKey: ["feeders", id],
    queryFn: () => getFeederById(id),
    enabled: !!id,
  });
}

export function useCreateFeeder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeederPayload) => createFeeder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeders"] });
    },
  });
}

export function useUpdateFeeder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFeederPayload;
    }) => updateFeeder(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["feeders"] });
      queryClient.invalidateQueries({ queryKey: ["feeders", id] });
    },
  });
}

export function useDeleteFeeder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFeeder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeders"] });
    },
  });
}

/* Areas Hooks */
export function useAreas(params?: { feederId?: string }) {
  return useQuery({
    queryKey: ["areas", params],
    queryFn: () => getAreas(params),
  });
}

export function useArea(id: string) {
  return useQuery({
    queryKey: ["areas", id],
    queryFn: () => getAreaById(id),
    enabled: !!id,
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAreaPayload) => createArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useUpdateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAreaPayload }) =>
      updateArea(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["areas", id] });
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}
