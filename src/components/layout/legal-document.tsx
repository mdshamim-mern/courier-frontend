import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  getLegalDocument,
  legalOperator,
  legalEffectiveDate,
  type LegalKind,
} from "@/content/legal";

export default function LegalDocument({ kind }: { kind: LegalKind }) {
  const locale = useLocale();
  const ui = useUiText();
  const document = getLegalDocument(locale, kind);
  const description =
    kind === "privacy"
      ? ui(
          "Learn how Dropzo handles information while supporting every delivery.",
        )
      : kind === "cookies"
        ? ui(
            "Understand the small pieces of data that help Dropzo work smoothly.",
          )
        : ui(
            "The terms that help keep every Dropzo delivery clear and reliable.",
          );

  return (
    <article className="page-wrap space-y-8 sm:space-y-10">
      <header className="legal-hero glass-panel overflow-hidden p-6 sm:p-9 lg:p-11">
        <div className="relative z-10 max-w-3xl">
          <span className="eyebrow rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {ui("Legal & Support")}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            {document.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
        <div className="legal-hero-orb" aria-hidden="true" />
      </header>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel legal-meta-card">
          <Building2 className="size-5 text-primary" aria-hidden="true" />
          <dt>{ui("Company")}</dt>
          <dd>{legalOperator.companyName}</dd>
        </div>
        <div className="glass-panel legal-meta-card">
          <CalendarDays className="size-5 text-primary" aria-hidden="true" />
          <dt>{ui("Effective date")}</dt>
          <dd>{legalEffectiveDate(locale)}</dd>
        </div>
        <div className="glass-panel legal-meta-card sm:col-span-2">
          <Mail className="size-5 text-primary" aria-hidden="true" />
          <dt>{ui("Questions about this policy?")}</dt>
          <dd>
            <a
              href={`mailto:${legalOperator.contactEmail}`}
              className="break-all text-primary underline decoration-primary/30 underline-offset-4 transition hover:decoration-primary"
            >
              {legalOperator.contactEmail}
            </a>
          </dd>
        </div>
      </dl>

      <div className="grid gap-4">
        {document.sections.map((section, index) => (
          <section
            key={section.title}
            className="glass-panel legal-section-card p-5 sm:p-7"
          >
            <div className="flex gap-4">
              <span className="legal-section-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="text-xl font-bold tracking-[-0.025em] sm:text-2xl">
                  {section.title.replace(/^\d+\.\s*/, "")}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="leading-8 text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <nav
        aria-label={ui("Legal & Support")}
        className="glass-panel flex flex-wrap gap-2 p-3 sm:gap-3"
      >
        {[
          ["/terms", ui("Terms of Service")],
          ["/privacy", ui("Privacy Policy")],
          ["/cookies", ui("Cookie Policy")],
          ["/contact", ui("Contact")],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="group inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/8 hover:text-primary"
          >
            {label}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </nav>
    </article>
  );
}
