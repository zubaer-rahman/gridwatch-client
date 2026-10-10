"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserById, getUsers, uploadUserAvatar } from "@/api/user.api";
import type { Role } from "@/types";

export function useUsers(query?: {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => getUsers(query),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: (response) => {
      if (response?.data?.avatar && typeof window !== "undefined") {
        localStorage.setItem("gridwatch_user_avatar", response.data.avatar);
        if (response.data.id) {
          localStorage.setItem(
            `gridwatch_user_avatar_${response.data.id}`,
            response.data.avatar,
          );
        }
        window.dispatchEvent(new Event("storage"));
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
