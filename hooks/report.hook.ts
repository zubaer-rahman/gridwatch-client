"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
} from "@/api/report.api";
import type { CreateReportPayload, ReportQuery } from "@/types";

export function useMyReports(query?: ReportQuery) {
  return useQuery({
    queryKey: ["reports", "me", query],
    queryFn: () => getMyReports(query),
  });
}

export function useReports(query?: ReportQuery) {
  return useQuery({
    queryKey: ["reports", query],
    queryFn: () => getAllReports(query),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportPayload) => createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "me"] });
      queryClient.invalidateQueries({ queryKey: ["outages"] });
    },
  });
}
