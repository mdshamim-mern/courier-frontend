import apiClient from "@/lib/apiClient";
import type { ApiResponse, Courier, CourierEarnings, User } from "@/types";

export const createCourier = (payload: Record<string, unknown>) =>
  apiClient<ApiResponse<{ user: User; courier: Courier }>>("/couriers", {
    method: "POST",
    body: payload,
  });
export const getAllCouriers = (params?: Record<string, unknown>) =>
  apiClient<ApiResponse<Courier[]>>("/couriers", { method: "GET", params });
export const getCourierDetails = (id: string) =>
  apiClient<ApiResponse<Courier>>(`/couriers/${encodeURIComponent(id)}`, {
    method: "GET",
  });
export const updateCourierProfile = (
  id: string,
  payload: Record<string, unknown>,
) =>
  apiClient<ApiResponse<Courier>>(`/couriers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });
export const getCourierHistoryAndEarnings = (id: string) =>
  apiClient<ApiResponse<CourierEarnings>>(
    `/couriers/${encodeURIComponent(id)}/history-earnings`,
    { method: "GET", cache: "no-store" },
  );
