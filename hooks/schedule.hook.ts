"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  getScheduleById,
  getSchedules,
  updateSchedule,
} from "@/api/schedule.api";
import { useCurrentUser } from "@/hooks/auth.hook";
import type {
  CreateSchedulePayload,
  ScheduleQuery,
  UpdateSchedulePayload,
} from "@/types";

export function useSchedules(query?: ScheduleQuery) {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ["schedules", query],
    queryFn: () => getSchedules(query),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
}

export function useSchedule(id: string) {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => getScheduleById(id),
    enabled: !!id && isAuthenticated,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) => createSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSchedulePayload;
    }) => updateSchedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });
}
