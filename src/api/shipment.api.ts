import apiClient from "@/lib/apiClient";

export function createShipment(payload: Record<string, unknown>) {
  return apiClient("/shipments", {
    method: "POST",
    body: payload,
  });
}

export function getAllShipments(params?: Record<string, unknown>) {
  return apiClient("/shipments", {
    method: "GET",
    params,
  });
}

export function getSingleShipment(id: string) {
  return apiClient(`/shipments/${id}`, {
    method: "GET",
  });
}

export function assignCourier(id: string, payload: Record<string, unknown>) {
  return apiClient(`/shipments/${id}/assign`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateShipmentStatus(id: string, payload: Record<string, unknown>) {
  return apiClient(`/shipments/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function cancelShipment(id: string) {
  return apiClient(`/shipments/${id}/cancel`, {
    method: "PATCH",
  });
}