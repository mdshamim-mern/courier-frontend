import { ofetch } from "ofetch";
import { getAccessToken } from "./auth-token";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  onRequest({ options }) {
    const token = getAccessToken();
    if (token) {
      options.headers = new Headers(options.headers);
      options.headers.set("Authorization", `Bearer ${token}`);
    }
  },
});

export default apiClient;