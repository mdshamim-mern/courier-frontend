import {
  createHub,
  deleteHub,
  getAllHubs,
  getSingleHub,
  updateHub,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
      queryClient.invalidateQueries({ queryKey: ["coverage"] });
      queryClient.invalidateQueries({ queryKey: ["operations-admin"] });
    },
  });
}

export function useGetAllHubs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["hubs", params],
    queryFn: () => getAllHubs(params),
  });
}

export function useGetSingleHub(id: string) {
  return useQuery({
    queryKey: ["hubs", id],
    queryFn: () => getSingleHub(id),
    enabled: !!id,
  });
}

export function useUpdateHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => updateHub(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
      queryClient.invalidateQueries({ queryKey: ["hubs", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["coverage"] });
      queryClient.invalidateQueries({ queryKey: ["operations-admin"] });
    },
  });
}

export function useDeleteHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
      queryClient.invalidateQueries({ queryKey: ["coverage"] });
      queryClient.invalidateQueries({ queryKey: ["operations-admin"] });
    },
  });
}
