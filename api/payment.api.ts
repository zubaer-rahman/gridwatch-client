import { apiClient } from "@/lib/apiClient";
import type {
  ApiResponse,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  Payment,
} from "@/types";

export function initiatePayment(
  payload: InitiatePaymentPayload,
): Promise<ApiResponse<InitiatePaymentResponse>> {
  return apiClient<ApiResponse<InitiatePaymentResponse>>("/payments/initiate", {
    method: "POST",
    body: payload,
  });
}

export function getPaymentById(id: string): Promise<ApiResponse<Payment>> {
  return apiClient<ApiResponse<Payment>>(`/payments/${id}`);
}

export function getAllPayments(): Promise<ApiResponse<Payment[]>> {
  return apiClient<ApiResponse<Payment[]>>("/payments");
}
