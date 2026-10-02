import apiClient from "@/lib/apiClient";

export function getDashboardStats() {
  return apiClient("/admin/dashboard-stats", {
    method: "GET",
  });
}

export function getAllUsers(params?: Record<string, unknown>) {
  return apiClient("/admin/users", {
    method: "GET",
    params,
  });
}

export function updateUserStatus(id: string, payload: Record<string, unknown>) {
  return apiClient(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateUserRole(id: string, payload: Record<string, unknown>) {
  return apiClient(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: payload,
  });
}

export function getAuditLogs(params?: Record<string, unknown>) {
  return apiClient("/audit-logs", {
    method: "GET",
    params,
  });
}