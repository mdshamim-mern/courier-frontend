"use client";

import Logo from "@/assets/svg/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetMe, useLogout } from "@/hooks";
import { toast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/types";

export default function Header() {
  const { data, isLoading } = useGetMe();
  const { mutate: logout, isPending } = useLogout();
  const queryClient = useQueryClient();
  const user = data?.data;

  const dashboardRoute: Record<UserRole, string> = {
    SUPER_ADMIN: "/admin",
    ADMIN: "/admin",
    COURIER: "/courier",
    CUSTOMER: "/dashboard",
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Logged Out",
          description: "You have been successfully logged out.",
          type: "success",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
        window.location.href = "/";
      },
      onError: () => {
        toast.add({
          title: "Logout Failed",
          description: "Something went wrong.",
          type: "error",
        });
      },
    });
  };

  return (
    <header className="w-full h-16 border-b bg-background/70 backdrop-blur-xl sticky top-0 z-50 transition-all shadow-sm">
      <div className="flex justify-between items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <Logo className="size-8" />
          <span className="font-bold tracking-tight text-xl hidden sm:block bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            PH Courier
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          {!isLoading && !user && (
            <>
              <Button variant="ghost" render={<Link href="/login" />} nativeButton={false} className="hidden sm:inline-flex">
                Login
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false} className="shadow-md">
                Sign Up
              </Button>
            </>
          )}
          {!isLoading && user && (
            <>
              <Button variant="outline" render={<Link href={dashboardRoute[user.role as UserRole]} />} nativeButton={false}>
                Dashboard
              </Button>
              <Button variant="destructive" onClick={handleLogout} disabled={isPending}>
                {isPending ? "Logging out..." : "Logout"}
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}