"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { UserRound } from "lucide-react";
import { useGetMe, useLogout } from "@/hooks";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
export default function AccountMenu() {
  const bn = useLocale() === "bn",
    pathname = usePathname();
  const { data } = useGetMe(),
    logout = useLogout(),
    router = useRouter(),
    cache = useQueryClient();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (pathname && menu.current) menu.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (
        e.target instanceof Node &&
        menu.current &&
        !menu.current.contains(e.target)
      )
        menu.current.open = false;
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  const root =
    data?.data.role === "ADMIN"
      ? "/admin"
      : data?.data.role === "COURIER"
        ? "/courier"
        : "/dashboard";
  return (
    <details ref={menu} className="relative ml-auto">
      <summary
        className="secondary-button cursor-pointer"
        aria-label={bn ? "অ্যাকাউন্ট মেনু" : "Account menu"}
      >
        <UserRound size={18} aria-hidden="true" />
        <span>{data?.data.name || (bn ? "অ্যাকাউন্ট" : "Account")}</span>
      </summary>
      <div className="glass-panel absolute right-0 z-50 mt-2 grid min-w-52 gap-3 p-4">
        <Link href={`${root}/profile`} className="text-link">
          {bn ? "প্রোফাইল" : "Profile"}
        </Link>
        <Link href={root} className="text-link">
          {bn ? "ড্যাশবোর্ড" : "Dashboard"}
        </Link>
        <button
          type="button"
          disabled={logout.isPending}
          className="secondary-button"
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => {
                cache.clear();
                router.replace("/");
                router.refresh();
              },
            })
          }
        >
          {bn ? "বের হন" : "Logout"}
        </button>
      </div>
    </details>
  );
}
