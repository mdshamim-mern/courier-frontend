import apiClient from "@/lib/apiClient";
import type { ApiResponse, User } from "@/types";

export const getMe = () => apiClient<ApiResponse<User>>("/users/me", { method: "GET" });
export const updateMyProfile = (payload: { name?: string; contactNumber?: string; address?: string }) => apiClient<ApiResponse<User>>("/users/me", { method: "PATCH", body: payload });
export const updateProfileImage = (payload: FormData) => apiClient<ApiResponse<User>>("/users/profile-image", { method: "PATCH", body: payload });
