"use client";
import Logo from "@/assets/svg/Logo";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useGetMe, useLogout } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
export default function Header() {
  const locale = useLocale(),
    bn = locale === "bn",
    t = useTranslations("Header");
  const pathname = usePathname(),
    router = useRouter(),
    query = useQueryClient();
  const { data, isLoading } = useGetMe(),
    user = data?.data,
    logout = useLogout();
  const links = [
    ["/dashboard/new-shipment", "Send a parcel", "পার্সেল পাঠান"],
    ["/track-shipment", "Track parcel", "পার্সেল অনুসরণ"],
    ["/pricing", "Delivery cost", "খরচ হিসাব"],
    ["/coverage", "Coverage", "সেবার এলাকা"],
    ["/merchant-register", "For business", "ব্যবসায়িক নিবন্ধন"],
    ["/about", "About", "পরিচিতি"],
    ["/contact", "Contact", "যোগাযোগ"],
  ];
  const dashboard =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "COURIER"
        ? "/courier"
        : "/dashboard";
  const language = (
    <button
      type="button"
      className="min-h-11 px-3 text-sm"
      aria-label={t("switchLanguage")}
      onClick={() =>
        router.replace(
          `${pathname}${window.location.search}${window.location.hash}`,
          { locale: bn ? "en" : "bn" },
        )
      }
    >
      {bn ? "English" : "বাংলা"}
    </button>
  );
  const accounts = (
    <>
      {!isLoading && !user && (
        <>
          <Link className="px-3 py-2" href="/login">
            {t("login")}
          </Link>
          <Link
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            href="/register"
          >
            {t("register")}
          </Link>
        </>
      )}
      {user && (
        <>
          <Link className="px-3 py-2" href={dashboard}>
            {t("dashboard")}
          </Link>
          <Button
            variant="outline"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => {
                  query.clear();
                  router.replace("/");
                  router.refresh();
                },
              })
            }
          >
            {t("logout")}
          </Button>
        </>
      )}
    </>
  );
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Dropzo" className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="text-xl font-bold text-primary">Dropzo</span>
        </Link>
        <div className="hidden items-center gap-2 lg:flex">
          {language}
          {accounts}
        </div>
        <details className="relative lg:hidden">
          <summary className="cursor-pointer rounded-md border p-3">
            {t("menu")}
          </summary>
          <nav
            aria-label={t("menu")}
            className="absolute right-0 top-full mt-2 flex max-h-[75vh] w-72 flex-col gap-2 overflow-auto rounded-xl border bg-background p-4 shadow-xl"
          >
            {links.map(([href, en, bangla]) => (
              <Link key={href} className="rounded-md px-2 py-3" href={href}>
                {bn ? bangla : en}
              </Link>
            ))}
            <Link className="px-2 py-3" href="/courier-apply">
              {bn ? "কর্মীর আবেদন" : "Worker application"}
            </Link>
            <Link className="px-2 py-3" href="/login?staff=1">
              {bn ? "কর্মীদের প্রবেশ" : "Staff sign in"}
            </Link>
            {language}
            {accounts}
          </nav>
        </details>
      </div>
      <nav
        aria-label={bn ? "প্রধান মেনু" : "Main navigation"}
        className="mx-auto hidden max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 pb-3 text-sm lg:flex"
      >
        {links.map(([href, en, bangla]) => (
          <Link key={href} className="py-2 hover:text-primary" href={href}>
            {bn ? bangla : en}
          </Link>
        ))}
        <Link href="/courier-apply" className="py-2">
          {bn ? "কর্মীর আবেদন" : "Join our team"}
        </Link>
        <Link href="/login?staff=1" className="py-2">
          {bn ? "কর্মীদের প্রবেশ" : "Staff sign in"}
        </Link>
      </nav>
    </header>
  );
}
