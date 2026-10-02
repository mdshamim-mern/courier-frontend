import {
  assignCourier,
  cancelShipment,
  createShipment,
  getAllShipments,
  getSingleShipment,
  updateShipmentStatus,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

export function useGetAllShipments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["shipments", params],
    queryFn: () => getAllShipments(params),
  });
}

export function useGetSingleShipment(id: string) {
  return useQuery({
    queryKey: ["shipments", id],
    queryFn: () => getSingleShipment(id),
    enabled: !!id,
  });
}

export function useAssignCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      assignCourier(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.id] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateShipmentStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.id] });
    },
  });
}

export function useCancelShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}