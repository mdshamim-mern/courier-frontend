"use client";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { ServiceArea } from "@/types/operations.type";

export function usePublicCoverage() {
  return useQuery({
    queryKey: ["coverage"],
    queryFn: () =>
      apiClient<ApiResponse<ServiceArea[]>>("/operations/coverage", {
        timeout: 15000,
      }),
    retry: false,
    staleTime: 60000,
  });
}
