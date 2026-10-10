import { apiClient } from "@/lib/apiClient";
import type {
  ApiResponse,
  CreateReportPayload,
  OutageReport,
  ReportQuery,
} from "@/types";

export function createReport(
  payload: CreateReportPayload,
): Promise<ApiResponse<OutageReport>> {
  return apiClient<ApiResponse<OutageReport>>("/reports", {
    method: "POST",
    body: payload,
  });
}

export function getMyReports(
  query?: ReportQuery,
): Promise<ApiResponse<OutageReport[]>> {
  return apiClient<ApiResponse<OutageReport[]>>("/reports/me", {
    query,
  });
}

export function getAllReports(
  query?: ReportQuery,
): Promise<ApiResponse<OutageReport[]>> {
  return apiClient<ApiResponse<OutageReport[]>>("/reports", {
    query,
  });
}

export function getReportById(id: string): Promise<ApiResponse<OutageReport>> {
  return apiClient<ApiResponse<OutageReport>>(`/reports/${id}`);
}
