import apiClient from "@/lib/apiClient";

export function createCourier(payload: Record<string, unknown>) {
  return apiClient("/couriers", {
    method: "POST",
    body: payload,
  });
}

export function getAllCouriers(params?: Record<string, unknown>) {
  return apiClient("/couriers", {
    method: "GET",
    params,
  });
}

export function getCourierDetails(id: string) {
  return apiClient(`/couriers/${id}`, {
    method: "GET",
  });
}

export function updateCourierProfile(id: string, payload: Record<string, unknown>) {
  return apiClient(`/couriers/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function getCourierHistoryAndEarnings(id: string) {
  return apiClient(`/couriers/${id}/history-earnings`, {
    method: "GET",
  });
}