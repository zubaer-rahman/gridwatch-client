export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface InitiatePaymentPayload {
  amount: number;
  outageReportId?: string;
  reason?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  bkashURL: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  reason?: string | null;
  outageReportId?: string | null;
  transactionId: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
