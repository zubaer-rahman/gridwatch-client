"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserById, getUsers } from "@/api/user.api";
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
