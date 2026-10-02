import apiClient from "@/lib/apiClient";

export function getMe() {
  return apiClient("/users/me", {
    method: "GET",
  });
}

export function updateMyProfile(payload: Record<string, unknown>) {
  return apiClient("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function updateProfileImage(payload: FormData) {
  return apiClient("/users/profile-image", {
    method: "PATCH",
    body: payload,
  });
}