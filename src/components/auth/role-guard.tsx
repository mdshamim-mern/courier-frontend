"use client";

import { useGetMe } from "@/hooks";
import type { ReactNode } from "react";
import type { UserRole } from "@/types";
import AuthGuard from "./auth-guard";
import AccessDenied from "./access-denied";

export default function RoleGuard({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const { data } = useGetMe();
  return <AuthGuard>{data?.data && roles.includes(data.data.role) ? children : <AccessDenied />}</AuthGuard>;
}
