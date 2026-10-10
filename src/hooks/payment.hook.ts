import { getPayments, getSinglePayment, initiatePayment } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: initiatePayment,
    meta: { errorToastHandled: true },
  });
}

export function useGetPayments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(params),
  });
}

export function useGetSinglePayment(id: string) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => getSinglePayment(id),
    enabled: !!id,
  });
}
