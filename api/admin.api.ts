import { apiClient } from "@/lib/apiClient";
import type {
  AdminStatistics,
  AdminUser,
  AdminUserQuery,
  ApiResponse,
  CreateUserInput,
  UpdateUserInput,
} from "@/types";

export function getAdminStatistics(): Promise<ApiResponse<AdminStatistics>> {
  return apiClient<ApiResponse<AdminStatistics>>("/admin/statistics");
}

export function getAdminUsers(
  query?: AdminUserQuery,
): Promise<ApiResponse<AdminUser[]>> {
  return apiClient<ApiResponse<AdminUser[]>>("/admin/users", {
    query,
  });
}

export function updateUserStatus(
  id: string,
  isActive: boolean,
): Promise<ApiResponse<AdminUser>> {
  return apiClient<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}

export function createInternalUser(
  payload: CreateUserInput,
): Promise<ApiResponse<AdminUser>> {
  return apiClient<ApiResponse<AdminUser>>("/users", {
    method: "POST",
    body: payload,
  });
}

export function updateUserDetails(
  id: string,
  payload: UpdateUserInput,
): Promise<ApiResponse<AdminUser>> {
  return apiClient<ApiResponse<AdminUser>>(`/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
