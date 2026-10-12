"use client";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import Logo from "@/assets/svg/Logo";
import { ArrowUp, ArrowUpRight, PackageCheck, ScanLine } from "lucide-react";

const groups = [
  {
    title: "Quick Links",
    links: [
      { href: "/", label: "Home" },
      { href: "/dashboard/new-shipment", label: "Send Parcel" },
      { href: "/pricing", label: "Pricing" },
      { href: "/coverage", label: "Coverage" },
      { href: "/merchant-register", label: "Merchant Registration" },
      { href: "/courier-apply", label: "Courier Application" },
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { href: "/services#standard-delivery", label: "Standard Delivery" },
      { href: "/services#express-delivery", label: "Express Courier" },
      {
        href: "/services#ecommerce-fulfillment",
        label: "E-commerce Logistics",
      },
      { href: "/contact", label: "Contact and delivery information" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export default function Footer() {
  const ui = useUiText();
  const locale = useLocale();
  const t = (en: string, bn: string) => (locale === "bn" ? bn : en);
  return (
    <footer className="site-footer w-full text-foreground">
      <div className="footer-wrap">
        <div className="footer-glass glass-panel">
          <section className="footer-action-bar">
            <div>
              <span className="icon-tile">
                <PackageCheck aria-hidden="true" />
              </span>
              <div>
                <h2>
                  {t(
                    "Your next delivery starts here",
                    "পরবর্তী ডেলিভারির শুরু এখানেই",
                  )}
                </h2>
                <p>
                  {t(
                    "Check the route. Review the charge. Book with clear details.",
                    "পথ যাচাই করুন। মাশুল দেখুন। সঠিক তথ্য দিয়ে বুকিং করুন।",
                  )}
                </p>
              </div>
            </div>
            <div className="footer-action-links">
              <Link className="secondary-button" href="/track-shipment">
                <ScanLine size={17} aria-hidden="true" />
                {t("Track a parcel", "পার্সেল খুঁজুন")}
              </Link>
              <Link className="secondary-button" href="/pricing">
                {t("Estimate delivery cost", "ডেলিভারির মাশুল দেখুন")}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </section>
          <div className="footer-link-grid">
            <div className="footer-brand">
              <Link href="/" className="brand-lockup">
                <Logo className="size-9" />
                <span className="brand-wordmark">
                  Dropzo<span className="brand-dot">.</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {ui(
                  "Dropzo serves approved areas through its own delivery team. Check coverage and pricing before booking.",
                )}
              </p>
              <Link className="text-link" href="/contact">
                {t("Talk to our team", "আমাদের দলের সঙ্গে যোগাযোগ")}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {groups.map((group) => (
              <div key={group.title} className="footer-link-group">
                <h2 className="font-semibold">{ui(group.title)}</h2>
                <nav aria-label={ui(group.title)} className="footer-nav-links">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="footer-nav-link"
                    >
                      {ui(link.label)}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div>
          <p className="text-sm text-muted-foreground">
            ©{" "}
            {new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US", {
              useGrouping: false,
            }).format(new Date().getFullYear())}{" "}
            {ui("Dropzo. All rights reserved.")}
          </p>
          <p className="text-sm text-muted-foreground">
            {ui("Designed for secure and fast logistics.")}
          </p>
          <button
            type="button"
            className="footer-top-button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            <ArrowUp size={16} aria-hidden="true" />
            {t("Back to top", "উপরে যান")}
          </button>
        </div>
      </div>
    </footer>
  );
}
