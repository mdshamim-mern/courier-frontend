import apiClient from "@/lib/apiClient";
import type { ApiResponse, DashboardStats, User, AuditLog } from "@/types";

export const getDashboardStats = () => apiClient<ApiResponse<DashboardStats>>("/admin/dashboard-stats", { method: "GET" });
export const getAllUsers = (params?: Record<string, unknown>) => apiClient<ApiResponse<User[]>>("/admin/users", { method: "GET", params });
export const updateUserStatus = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<User>>(`/admin/users/${encodeURIComponent(id)}/status`, { method: "PATCH", body: payload });
export const updateUserRole = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<User>>(`/admin/users/${encodeURIComponent(id)}/role`, { method: "PATCH", body: payload });
export const getAuditLogs = (params?: Record<string, unknown>) => apiClient<ApiResponse<AuditLog[]>>("/audit-logs", { method: "GET", params });
