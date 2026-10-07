import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { MapPin, Mail, Clock3 } from "lucide-react";

export default function ContactPage() {
  const ui = useUiText();
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16 sm:px-6">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">{ui("Contact Us")}</h1>
        <p className="text-muted-foreground">
          {ui(
            "Contact information is not configured yet. Replace the placeholders before accepting support requests.",
          )}
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <MapPin aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Head Office")}</h2>
          <p>Dropzo</p>
          <p>Love Road, Mirpur 2, Dhaka</p>
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <Mail aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Contact Details")}</h2>
          <p>mdshamim.mern@gmail.com</p>
          <p>01865-190471</p>
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <Clock3 aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Business Hours")}</h2>
          <p>24/7 Online Support</p>
        </section>
      </div>
      <aside role="note" className="rounded-xl border p-6">
        <p>
          {ui(
            "Contact form is not available until a verified support address is configured.",
          )}
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
