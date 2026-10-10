import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, Role, User } from "@/types";

export function getUsers(query?: {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<User[]>> {
  return apiClient<ApiResponse<User[]>>("/users", {
    query,
  });
}

export function getUserById(id: string): Promise<ApiResponse<User>> {
  return apiClient<ApiResponse<User>>(`/users/${id}`);
}

export function updateUser(
  id: string,
  payload: Partial<User>,
): Promise<ApiResponse<User>> {
  return apiClient<ApiResponse<User>>(`/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
