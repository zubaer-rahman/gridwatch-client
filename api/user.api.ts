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

export function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiClient<ApiResponse<User>>("/users/me");
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

export interface UploadAvatarResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export function uploadUserAvatar(
  file: File,
): Promise<ApiResponse<UploadAvatarResponse>> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ApiResponse<UploadAvatarResponse>>("/users/me/avatar", {
    method: "PATCH",
    body: formData,
  });
}
