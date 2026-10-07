import apiClient from "@/lib/apiClient";
import type { ApiResponse, Shipment, PublicShipmentTracking } from "@/types";

export const getShipmentSummary = () => apiClient<ApiResponse<{ totalShipments: number; activeShipments: number; deliveredShipments: number }>>("/shipments/summary");

export const createShipment = (payload: Record<string, unknown>) => apiClient<ApiResponse<Shipment>>("/shipments", { method: "POST", body: payload });
export const getAllShipments = (params?: Record<string, unknown>) => apiClient<ApiResponse<Shipment[]>>("/shipments", { method: "GET", params });
export const getSingleShipment = (id: string) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}`, { method: "GET" });
export const trackShipment = (trackingId: string) => apiClient<ApiResponse<PublicShipmentTracking>>(`/shipments/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`, { method: "GET" });
export const assignCourier = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}/assign`, { method: "PATCH", body: payload });
export const updateShipmentStatus = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}/status`, { method: "PATCH", body: payload });
export const cancelShipment = (id: string) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}/cancel`, { method: "PATCH" });
