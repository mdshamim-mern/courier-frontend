import apiClient from "@/lib/apiClient";
import type { ApiResponse, Payment } from "@/types";

type PaymentRequest = { shipmentId: string };
type PaymentCheckout = { paymentUrl: string; shipmentId: string };
export const reconcilePayment = (payload: PaymentRequest) => apiClient<ApiResponse<{ shipmentId: string; status: string }>>("/payments/reconcile", { method: "POST", body: payload });
export const initiatePayment = (payload: PaymentRequest) => apiClient<ApiResponse<PaymentCheckout>>("/payments/initiate", { method: "POST", body: payload });
export const initiateStripePayment = (payload: PaymentRequest) => apiClient<ApiResponse<PaymentCheckout>>("/payments/stripe/initiate", { method: "POST", body: payload });
export const getPayments = (params?: Record<string, unknown>) => apiClient<ApiResponse<Payment[]>>("/payments", { method: "GET", params });
export const getSinglePayment = (id: string) => apiClient<ApiResponse<Payment>>(`/payments/${encodeURIComponent(id)}`, { method: "GET" });
