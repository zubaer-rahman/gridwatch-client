"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInternalUser,
  getAdminStatistics,
  getAdminUsers,
  updateUserDetails,
  updateUserStatus,
} from "@/api/admin.api";
import type { AdminUserQuery, CreateUserInput, UpdateUserInput } from "@/types";

export function useAdminStatistics() {
  return useQuery({
    queryKey: ["admin", "statistics"],
    queryFn: () => getAdminStatistics(),
  });
}

export function useAdminUsers(query?: AdminUserQuery) {
  return useQuery({
    queryKey: ["admin", "users", query],
    queryFn: () => getAdminUsers(query),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateInternalUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserInput) => createInternalUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserInput }) =>
      updateUserDetails(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
