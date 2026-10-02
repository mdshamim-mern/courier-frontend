import apiClient from "@/lib/apiClient";

export function createHub(payload: Record<string, unknown>) {
  return apiClient("/hubs", {
    method: "POST",
    body: payload,
  });
}

export function getAllHubs(params?: Record<string, unknown>) {
  return apiClient("/hubs", {
    method: "GET",
    params,
  });
}

export function getSingleHub(id: string) {
  return apiClient(`/hubs/${id}`, {
    method: "GET",
  });
}

export function updateHub(id: string, payload: Record<string, unknown>) {
  return apiClient(`/hubs/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteHub(id: string) {
  return apiClient(`/hubs/${id}`, {
    method: "DELETE",
  });
}