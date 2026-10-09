import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import Logo from "@/assets/svg/Logo";

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
  return (
    <footer className="site-footer w-full text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
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
          </div>
          {groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h2 className="font-semibold">{ui(group.title)}</h2>
              <nav
                aria-label={ui(group.title)}
                className="flex flex-col gap-3 text-sm text-muted-foreground"
              >
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {ui(link.label)}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t bg-muted/20 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
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
        </div>
      </div>
    </footer>
  );
}
