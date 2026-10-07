export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type PaymentGateway = "BKASH" | "STRIPE" | "SSLCOMMERZ";

export interface Payment {
  id: string;
  shipmentId: string;
  amount: number | string;
  currency: string;
  paymentGateway: PaymentGateway;
  transactionId?: string | null;
  status: PaymentStatus;
  payerReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
