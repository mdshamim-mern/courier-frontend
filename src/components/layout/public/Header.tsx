"use client";
import Logo from "@/assets/svg/Logo";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useGetMe, useLogout } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe2, Menu, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

export default function Header() {
  const locale = useLocale(),
    bn = locale === "bn",
    t = useTranslations("Header");
  const pathname = usePathname(),
    router = useRouter(),
    query = useQueryClient();
  const header = useRef<HTMLElement>(null),
    mobile = useRef<HTMLDetailsElement>(null),
    team = useRef<HTMLDetailsElement>(null);
  const closeMenus = useCallback(() => {
    if (mobile.current) mobile.current.open = false;
    if (team.current) team.current.open = false;
  }, []);
  const { data, isLoading } = useGetMe(),
    user = data?.data,
    logout = useLogout();
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${element.getBoundingClientRect().height}px`,
      ),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (pathname && locale) closeMenus();
  }, [pathname, locale, closeMenus]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      for (const menu of [team.current, mobile.current]) {
        if (
          menu &&
          event.target instanceof Node &&
          !menu.contains(event.target)
        )
          menu.open = false;
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      for (const menu of [team.current, mobile.current]) {
        if (menu?.open) {
          menu.open = false;
          menu.querySelector("summary")?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
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
      className="language-button"
      aria-label={t("switchLanguage")}
      onClick={() =>
        router.replace(
          `${pathname}${window.location.search}${window.location.hash}`,
          { locale: bn ? "en" : "bn" },
        )
      }
    >
      <Globe2 size={16} aria-hidden="true" />
      {bn ? "English" : "বাংলা"}
    </button>
  );
  const accounts = (
    <>
      {!isLoading && !user && (
        <>
          <Link className="account-link" href="/login">
            {t("login")}
          </Link>
          <Link className="brand-button header-register" href="/register">
            {t("register")}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </>
      )}
      {user && (
        <>
          <Link className="account-link" href={dashboard}>
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
    <header ref={header} className="site-header">
      <div className="header-row">
        <Link href="/" aria-label="Dropzo" className="brand-lockup">
          <Logo className="size-10" />
          <span className="brand-wordmark">
            Dropzo<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav
          aria-label={bn ? "প্রধান মেনু" : "Main navigation"}
          className="desktop-nav"
        >
          {links.map(([href, en, bangla]) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              aria-current={pathname === href ? "page" : undefined}
            >
              {bn ? bangla : en}
            </Link>
          ))}
          <details ref={team} className="team-menu">
            <summary className="nav-link">
              {bn ? "দল" : "Team"}
              <ChevronDown size={13} aria-hidden="true" />
            </summary>
            <div className="team-dropdown glass-panel">
              <Link href="/courier-apply" onClick={closeMenus}>
                {bn ? "কর্মীর আবেদন" : "Join our team"}
              </Link>
              <Link href="/login?staff=1" onClick={closeMenus}>
                {bn ? "কর্মীদের প্রবেশ" : "Staff sign in"}
              </Link>
            </div>
          </details>
        </nav>
        <div className="desktop-accounts">
          {language}
          {accounts}
        </div>
        <details ref={mobile} className="mobile-menu">
          <summary aria-label={t("menu")}>
            <Menu size={22} aria-hidden="true" />
            <span className="sr-only">{t("menu")}</span>
          </summary>
          <nav aria-label={t("menu")} className="mobile-dropdown glass-panel">
            {links.map(([href, en, bangla]) => (
              <Link key={href} href={href} onClick={closeMenus}>
                {bn ? bangla : en}
              </Link>
            ))}
            <Link href="/courier-apply" onClick={closeMenus}>
              {bn ? "কর্মীর আবেদন" : "Worker application"}
            </Link>
            <Link href="/login?staff=1" onClick={closeMenus}>
              {bn ? "কর্মীদের প্রবেশ" : "Staff sign in"}
            </Link>
            <div className="mobile-accounts">
              {language}
              {accounts}
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
