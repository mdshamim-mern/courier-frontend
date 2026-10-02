import apiClient from "@/lib/apiClient";

export function registerCustomer(payload: Record<string, unknown>) {
  return apiClient("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function verifyEmail(payload: Record<string, unknown>) {
  return apiClient("/auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

export function userLogin(payload: Record<string, unknown>) {
  return apiClient("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function refreshToken() {
  return apiClient("/auth/refresh-token", {
    method: "POST",
  });
}

export function googleOAuth(payload: Record<string, unknown>) {
  return apiClient("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export function forgotPassword(payload: Record<string, unknown>) {
  return apiClient("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function resetPassword(payload: Record<string, unknown>) {
  return apiClient("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export function userLogout() {
  return apiClient("/auth/logout", {
    method: "POST",
  });
}