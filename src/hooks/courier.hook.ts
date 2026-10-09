import {
  createCourier,
  getAllCouriers,
  getCourierDetails,
  getCourierHistoryAndEarnings,
  updateCourierProfile,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["operations-admin"] });
    },
  });
}

export function useGetAllCouriers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["couriers", params],
    queryFn: () => getAllCouriers(params),
  });
}

export function useGetCourierDetails(id: string) {
  return useQuery({
    queryKey: ["couriers", id],
    queryFn: () => getCourierDetails(id),
    enabled: !!id,
  });
}

export function useUpdateCourierProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => updateCourierProfile(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
      queryClient.invalidateQueries({ queryKey: ["couriers", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["operations-admin"] });
    },
  });
}

export function useGetCourierHistoryAndEarnings(id: string) {
  return useQuery({
    queryKey: ["couriers", "history-earnings", id],
    queryFn: () => getCourierHistoryAndEarnings(id),
    enabled: !!id,
  });
}
