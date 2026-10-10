import { apiClient } from "@/lib/apiClient";
import type {
  ApiResponse,
  CreateSchedulePayload,
  Schedule,
  ScheduleQuery,
  UpdateSchedulePayload,
} from "@/types";

export function getSchedules(
  query?: ScheduleQuery,
): Promise<ApiResponse<Schedule[]>> {
  return apiClient<ApiResponse<Schedule[]>>("/schedules", {
    query,
  });
}

export function getScheduleById(id: string): Promise<ApiResponse<Schedule>> {
  return apiClient<ApiResponse<Schedule>>(`/schedules/${id}`);
}

export function createSchedule(
  payload: CreateSchedulePayload,
): Promise<ApiResponse<Schedule>> {
  return apiClient<ApiResponse<Schedule>>("/schedules", {
    method: "POST",
    body: payload,
  });
}

export function updateSchedule(
  id: string,
  payload: UpdateSchedulePayload,
): Promise<ApiResponse<Schedule>> {
  return apiClient<ApiResponse<Schedule>>(`/schedules/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSchedule(
  id: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiClient<ApiResponse<{ id: string }>>(`/schedules/${id}`, {
    method: "DELETE",
  });
}
