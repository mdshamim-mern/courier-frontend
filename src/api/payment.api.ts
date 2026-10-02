import apiClient from "@/lib/apiClient";

export function initiatePayment(payload: Record<string, unknown>) {
  return apiClient("/payments/initiate", {
    method: "POST",
    body: payload,
  });
}

export function getPayments(params?: Record<string, unknown>) {
  return apiClient("/payments", {
    method: "GET",
    params,
  });
}

export function getSinglePayment(id: string) {
  return apiClient(`/payments/${id}`, {
    method: "GET",
  });
}