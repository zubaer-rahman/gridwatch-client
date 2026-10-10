"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOutage,
  deleteOutage,
  getOutageById,
  getOutages,
  updateOutage,
} from "@/api/outage.api";
import type {
  CreateOutagePayload,
  OutageFilters,
  UpdateOutagePayload,
} from "@/types";

export function useOutages(filters?: OutageFilters) {
  return useQuery({
    queryKey: ["outages", filters],
    queryFn: () => getOutages(filters),
  });
}

export function useOutage(id: string) {
  return useQuery({
    queryKey: ["outages", id],
    queryFn: () => getOutageById(id),
    enabled: !!id,
  });
}

export function useCreateOutage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOutagePayload) => createOutage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
    },
  });
}

export function useUpdateOutage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOutagePayload;
    }) => updateOutage(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      queryClient.invalidateQueries({ queryKey: ["outages", id] });
    },
  });
}

export function useDeleteOutage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOutage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
    },
  });
}
