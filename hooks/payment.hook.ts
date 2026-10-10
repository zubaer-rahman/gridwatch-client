"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPayments,
  getPaymentById,
  initiatePayment,
} from "@/api/payment.api";
import type { InitiatePaymentPayload } from "@/types";

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => getPaymentById(id),
    enabled: !!id,
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => getAllPayments(),
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) => initiatePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "me"] });
    },
  });
}
