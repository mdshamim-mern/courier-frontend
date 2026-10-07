"use client";

import Logo from "@/assets/svg/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useGetMe, useLogout } from "@/hooks";
import { toast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/types";
import { Search, Menu, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { clearAccessToken } from "@/lib/auth-token";

export default function Header() {
  const t = useTranslations("Header");
  const { data, isLoading } = useGetMe();
  const { mutate: logout, isPending } = useLogout();
  const queryClient = useQueryClient();
  const user = data?.data;

  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] === "bn" ? "bn" : "en";

  const dashboardRoute: Record<UserRole, string> = {
    ADMIN: "/admin",
    COURIER: "/courier",
    CUSTOMER: "/dashboard",
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        clearAccessToken();
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

  const toggleLang = () => {
    const nextLocale = currentLocale === "en" ? "bn" : "en";
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || "/");
  };

  return (
    <header className="w-full h-16 border-b bg-background/70 backdrop-blur-xl sticky top-0 z-50 transition-all shadow-sm">
      <div className="flex justify-between items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <Logo className="size-8" />
          <span className="font-bold tracking-tight text-xl hidden sm:block bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dropzo
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/services" className="hover:text-primary transition-colors">{t("services")}</Link>
          <Link href="/about" className="hover:text-primary transition-colors">{t("about")}</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">{t("contact")}</Link>
        </div>

        <nav className="hidden md:flex items-center gap-3">
          <Button variant="outline" render={<Link href="/track-shipment" />} nativeButton={false} className="gap-2 border-primary/20 hover:bg-primary/5">
            <Search className="size-4" /> {t("track")}
          </Button>

          <Button variant="ghost" onClick={toggleLang} className="gap-1 px-2 text-muted-foreground hover:text-foreground">
            <Globe className="size-4" /> {currentLocale.toUpperCase()}
          </Button>

          {!isLoading && !user && (
            <>
              <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
                {t("login")}
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false} className="shadow-md">
                {t("register")}
              </Button>
            </>
          )}
          
          {!isLoading && user && (
            <>
              <Button variant="outline" render={<Link href={dashboardRoute[user.role as UserRole]} />} nativeButton={false}>
                {t("dashboard")}
              </Button>
              <Button variant="destructive" onClick={handleLogout} disabled={isPending}>
                {isPending ? t("loggingOut") : t("logout")}
              </Button>
            </>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <Button variant="outline" render={<Link href="/track-shipment" />} nativeButton={false} className="px-3 border-primary/20">
            <Search className="size-4" />
          </Button>
          
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" className="px-3" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">{t("menu")}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link href="/services" className="text-lg font-medium hover:text-primary">{t("services")}</Link>
                <Link href="/about" className="text-lg font-medium hover:text-primary">{t("about")}</Link>
                <Link href="/contact" className="text-lg font-medium hover:text-primary">{t("contact")}</Link>
                
                <Button variant="ghost" className="justify-start px-0 text-lg font-medium" onClick={toggleLang}>
                  <Globe className="size-5 mr-2" /> {t("language")}{currentLocale.toUpperCase()}
                </Button>
                
                <hr className="my-2 border-border" />
                
                {!isLoading && !user && (
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" render={<Link href="/login" />} nativeButton={false} className="w-full">
                      {t("login")}
                    </Button>
                    <Button render={<Link href="/register" />} nativeButton={false} className="w-full">
                      {t("register")}
                    </Button>
                  </div>
                )}
                
                {!isLoading && user && (
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" render={<Link href={dashboardRoute[user.role as UserRole]} />} nativeButton={false} className="w-full">
                      {t("dashboard")}
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} disabled={isPending} className="w-full">
                      {isPending ? t("loggingOut") : t("logout")}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}