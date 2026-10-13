"use client";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { ServiceArea } from "@/types/operations.type";

export function usePublicCoverage() {
  return useQuery({
    queryKey: ["coverage"],
    queryFn: async () => {
      const response = await apiClient<ApiResponse<ServiceArea[]>>(
        "/operations/coverage",
        {
          timeout: 15000,
        },
      );
      if (
        !response.success ||
        !Array.isArray(response.data) ||
        response.data.some(
          (area) =>
            !area ||
            typeof area.id !== "string" ||
            typeof area.name !== "string" ||
            typeof area.district !== "string" ||
            typeof area.pickupEnabled !== "boolean" ||
            typeof area.deliveryEnabled !== "boolean",
        )
      )
        throw new Error("Coverage information unavailable");
      return response;
    },
    retry: false,
    staleTime: 60000,
  });
}
