import { apiClient } from "@/lib/apiClient";
import type {
  ApiResponse,
  CreateOutagePayload,
  Outage,
  OutageFilters,
  UpdateOutagePayload,
} from "@/types";

export function getOutages(
  filters?: OutageFilters,
): Promise<ApiResponse<Outage[]>> {
  return apiClient<ApiResponse<Outage[]>>("/outages", {
    query: filters,
  });
}

export function getOutageById(id: string): Promise<ApiResponse<Outage>> {
  return apiClient<ApiResponse<Outage>>(`/outages/${id}`);
}

export function createOutage(
  payload: CreateOutagePayload,
): Promise<ApiResponse<Outage>> {
  return apiClient<ApiResponse<Outage>>("/outages", {
    method: "POST",
    body: payload,
  });
}

export function updateOutage(
  id: string,
  payload: UpdateOutagePayload,
): Promise<ApiResponse<Outage>> {
  return apiClient<ApiResponse<Outage>>(`/outages/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteOutage(id: string): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>(`/outages/${id}`, {
    method: "DELETE",
  });
}
