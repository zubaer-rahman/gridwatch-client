"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  getMyAssignments,
} from "@/api/assignment.api";
import type { CreateAssignmentPayload } from "@/types";

export function useAssignments(query?: {
  operatorId?: string;
  outageId?: string;
}) {
  return useQuery({
    queryKey: ["assignments", query],
    queryFn: () => getAssignments(query),
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ["assignments", "me"],
    queryFn: () => getMyAssignments(),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      queryClient.invalidateQueries({
        queryKey: ["outages", variables.outageId],
      });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}
