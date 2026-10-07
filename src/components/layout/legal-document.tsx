import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { getLegalDocument, type LegalKind } from "@/content/legal";

export default function LegalDocument({ kind }: { kind: LegalKind }) {
  const locale = useLocale();
  const ui = useUiText();
  const document = getLegalDocument(locale, kind);
  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{document.title}</h1>
        <aside
          role="note"
          className="rounded-xl border border-amber-400 bg-amber-50 p-5 text-amber-950"
        >
          <h2 className="font-semibold">
            {ui("Draft — not a final legal document")}
          </h2>
          <p className="mt-2">
            {ui(
              "Fill in every placeholder and obtain legal review before publishing this as your final policy.",
            )}
          </p>
        </aside>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">{ui("Company")}</dt>
            <dd>[Company Name]</dd>
          </div>
          <div>
            <dt className="font-semibold">{ui("Effective date")}</dt>
            <dd>[Effective Date]</dd>
          </div>
          <div>
            <dt className="font-semibold">{ui("Legal address")}</dt>
            <dd>[Address]</dd>
          </div>
          <div>
            <dt className="font-semibold">{ui("Contact")}</dt>
            <dd>[Contact Email]</dd>
          </div>
        </dl>
      </header>
      {document.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <nav
        aria-label={ui("Legal & Support")}
        className="flex flex-wrap gap-5 border-t pt-6"
      >
        <Link href="/terms" className="underline">
          {ui("Terms of Service")}
        </Link>
        <Link href="/privacy" className="underline">
          {ui("Privacy Policy")}
        </Link>
        <Link href="/cookies" className="underline">
          {ui("Cookie Policy")}
        </Link>
        <Link href="/contact" className="underline">
          {ui("Contact")}
        </Link>
      </nav>
    </article>
  );
}
