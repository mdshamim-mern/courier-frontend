import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { MapPin, Mail, Clock3 } from "lucide-react";
import { useLocale } from "next-intl";
import { legalOperator } from "@/content/legal";

export default function ContactPage() {
  const ui = useUiText();
  const bengali = useLocale() === "bn";
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16 sm:px-6">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">{ui("Contact Us")}</h1>
        <p className="text-muted-foreground">
          {bengali
            ? "সহায়তার জন্য নিচের ইমেইল বা ফোন নম্বরে যোগাযোগ করুন।"
            : "For support, contact us using the email or phone number below."}
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <MapPin aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Head Office")}</h2>
          <p>{legalOperator.companyName}</p>
          <p>{legalOperator.address}</p>
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <Mail aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Contact Details")}</h2>
          <p>
            <a
              href={`mailto:${legalOperator.contactEmail}`}
              className="underline"
            >
              {legalOperator.contactEmail}
            </a>
          </p>
          <p>
            <a
              href={`tel:${legalOperator.contactPhone.replaceAll("-", "")}`}
              className="underline"
            >
              {legalOperator.contactPhone}
            </a>
          </p>
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <Clock3 aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Business Hours")}</h2>
          <p>
            {bengali
              ? "সহায়তার সময় ফোন বা ইমেইলে নিশ্চিত করুন।"
              : "Please confirm support hours by phone or email."}
          </p>
        </section>
      </div>
      <aside role="note" className="rounded-xl border p-6">
        <p>
          {bengali
            ? "এই সাইটে বার্তা পাঠানোর ফরম নেই। সহায়তার অনুরোধ ইমেইল বা ফোনে জানান।"
            : "This site does not provide a contact form. Send support requests by email or phone."}
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <Link href="/faq" className="text-primary underline">
            {ui("View frequently asked questions")}
          </Link>
          <Link href="/privacy" className="text-primary underline">
            {ui("Read our privacy policy")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
