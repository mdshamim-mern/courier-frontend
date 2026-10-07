"use client";

import { useGetMe } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorStatus } from "@/lib/api-error";
import type { ReactNode } from "react";
import { useEffect } from "react";
import AuthLoading from "./auth-loading";
import AccessDenied from "./access-denied";
import QueryError from "../ui/query-error";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, error, refetch } = useGetMe();
  const status = getApiErrorStatus(error);
  useEffect(() => {
    if (status === 401) router.replace("/login");
  }, [status, router]);
  if (isPending || status === 401) return <AuthLoading />;
  if (status === 403) return <AccessDenied />;
  if (error || !data?.data) return <QueryError retry={() => { void refetch(); }} />;
  return <>{children}</>;
}
