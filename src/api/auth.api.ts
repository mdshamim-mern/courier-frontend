import apiClient from "@/lib/apiClient";
import type { ApiResponse, LoginPayload, LoginResponse, RegistrationPayload, VerifyEmailPayload, VerifyEmailResponse } from "@/types";

export const registerCustomer = (payload: RegistrationPayload) => apiClient<ApiResponse<null>>("/auth/register", { method: "POST", body: payload });
export const verifyEmail = (payload: VerifyEmailPayload) => apiClient<ApiResponse<VerifyEmailResponse>>("/auth/verify-email", { method: "POST", body: payload });
export const userLogin = (payload: LoginPayload) => apiClient<ApiResponse<LoginResponse>>("/auth/login", { method: "POST", body: payload });
export const refreshToken = () => apiClient<ApiResponse<LoginResponse>>("/auth/refresh-token", { method: "POST" });
export const googleOAuth = (payload: { idToken: string }) => apiClient<ApiResponse<LoginResponse>>("/auth/google", { method: "POST", body: payload });
export const forgotPassword = (payload: { email: string }) => apiClient<ApiResponse<null>>("/auth/forgot-password", { method: "POST", body: payload });
export const resetPassword = (payload: VerifyEmailPayload & { newPassword: string }) => apiClient<ApiResponse<null>>("/auth/reset-password", { method: "POST", body: payload });
export const userLogout = () => apiClient<ApiResponse<null>>("/auth/logout", { method: "POST" });
