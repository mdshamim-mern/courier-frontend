import apiClient from "@/lib/apiClient";
import type { ApiResponse, Hub } from "@/types";

export const createHub = (payload: Record<string, unknown>) => apiClient<ApiResponse<Hub>>("/hubs", { method: "POST", body: payload });
export const getAllHubs = (params?: Record<string, unknown>) => apiClient<ApiResponse<Hub[]>>("/hubs", { method: "GET", params });
export const getSingleHub = (id: string) => apiClient<ApiResponse<Hub>>(`/hubs/${encodeURIComponent(id)}`, { method: "GET" });
export const updateHub = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Hub>>(`/hubs/${encodeURIComponent(id)}`, { method: "PATCH", body: payload });
export const deleteHub = (id: string) => apiClient<ApiResponse<Hub>>(`/hubs/${encodeURIComponent(id)}`, { method: "DELETE" });
