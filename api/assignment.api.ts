import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, Assignment, CreateAssignmentPayload } from "@/types";

export function createAssignment(
  payload: CreateAssignmentPayload,
): Promise<ApiResponse<Assignment>> {
  return apiClient<ApiResponse<Assignment>>("/assignments", {
    method: "POST",
    body: payload,
  });
}

export function getAssignments(query?: {
  operatorId?: string;
  outageId?: string;
}): Promise<ApiResponse<Assignment[]>> {
  return apiClient<ApiResponse<Assignment[]>>("/assignments", {
    query,
  });
}

export function getMyAssignments(): Promise<ApiResponse<Assignment[]>> {
  return apiClient<ApiResponse<Assignment[]>>("/assignments/me");
}

export function deleteAssignment(id: string): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>(`/assignments/${id}`, {
    method: "DELETE",
  });
}
