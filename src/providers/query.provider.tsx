"use client";

import {
  isServer,
  QueryCache,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ReactNode } from "react";

function makeQueryClient() {
  const report = (error: Error) => {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 401) return;
    const bn =
      typeof document !== "undefined" && document.documentElement.lang === "bn";
    toast.add({
      title: bn ? "অনুরোধ সম্পন্ন হয়নি" : "Request failed",
      description: getApiErrorMessage(
        error,
        bn ? "আবার চেষ্টা করুন।" : "Please try again.",
      ),
      type: "error",
    });
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: report }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.errorToastHandled) report(error);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
