import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("contact", params);
}
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import {
  MapPin,
  Mail,
  Clock3,
  ArrowUpRight,
  BadgeCheck,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "next-intl";
import { legalOperator } from "@/content/legal";
import styles from "./contact.module.css";

export default function ContactPage() {
  const ui = useUiText();
  const bengali = useLocale() === "bn";
  return (
    <div className={`page-wrap space-y-8 sm:space-y-10 ${styles.page}`}>
      <header className={`contact-hero glass-panel ${styles.hero}`}>
        <div className="space-y-5">
          <span className="eyebrow mx-auto rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5">
            <BadgeCheck className="size-4" aria-hidden="true" />
            {bengali ? "সহায়তা কেন্দ্র" : "Support center"}
          </span>
          <h1 className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            {ui("Contact Us")}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {bengali
              ? "সহায়তার জন্য নিচের ইমেইল বা ফোন নম্বরে যোগাযোগ করুন।"
              : "For support, contact us using the email or phone number below."}
          </p>
          <div className={styles.actions}>
            <a
              className="brand-button"
              href={`mailto:${legalOperator.contactEmail}`}
            >
              <Mail size={18} aria-hidden="true" />
              {bengali ? "ইমেইল করুন" : "Email support"}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="secondary-button"
              href={`tel:${legalOperator.contactPhone.replaceAll("-", "")}`}
            >
              <Phone size={18} aria-hidden="true" />
              {bengali ? "ফোন করুন" : "Call our team"}
            </a>
          </div>
        </div>
        <aside
          className={styles.prepare}
          aria-labelledby="contact-prepare-title"
        >
          <span className="icon-tile">
            <ShieldCheck aria-hidden="true" />
          </span>
          <h2 id="contact-prepare-title">
            {bengali ? "সহায়তা পেতে যা জানাবেন" : "Help us help you"}
          </h2>
          <p>
            {bengali
              ? "বুকিং বা অর্থপ্রদানের সমস্যা হলে এই তথ্যগুলো সঙ্গে রাখুন।"
              : "For a booking or payment question, have these details ready."}
          </p>
          <ul>
            <li>
              {bengali ? "পার্সেলের অনুসরণ নম্বর" : "Your parcel tracking ID"}
            </li>
            <li>
              {bengali
                ? "সমস্যার সংক্ষিপ্ত বিবরণ ও সময়"
                : "A short description and when it happened"}
            </li>
            <li>
              {bengali
                ? "প্রয়োজনে গোপন তথ্য বাদ দিয়ে স্ক্রিনশট"
                : "A screenshot with private information hidden"}
            </li>
          </ul>
          <p className={styles.safety}>
            {bengali
              ? "পাসওয়ার্ড, পিন বা ওটিপি পাঠাবেন না।"
              : "Never share your password, PIN or OTP."}
          </p>
        </aside>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="glass-panel info-card min-w-0 space-y-4 p-6 sm:p-8">
          <span className="icon-tile">
            <MapPin aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold">{ui("Head Office")}</h2>
          <p className="text-base font-medium text-foreground">
            {legalOperator.companyName}
          </p>
          <p className="text-base">{legalOperator.address}</p>
          <a
            className="secondary-button"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(legalOperator.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {bengali ? "ম্যাপে ঠিকানা খুঁজুন" : "Find address on map"}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>
        <section className="glass-panel info-card min-w-0 space-y-4 p-6 sm:p-8">
          <span className="icon-tile">
            <Mail aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold">{ui("Contact Details")}</h2>
          <p className="leading-7">
            <a
              href={`mailto:${legalOperator.contactEmail}`}
              className="break-all font-medium text-primary underline underline-offset-4"
            >
              {legalOperator.contactEmail}
            </a>
          </p>
          <p className="leading-7">
            <a
              href={`tel:${legalOperator.contactPhone.replaceAll("-", "")}`}
              className="break-all font-medium text-primary underline underline-offset-4"
            >
              {legalOperator.contactPhone}
            </a>
          </p>
        </section>
        <section className="glass-panel info-card min-w-0 space-y-4 p-6 sm:p-8">
          <span className="icon-tile">
            <Clock3 aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold">{ui("Business Hours")}</h2>
          <p className="text-base leading-7">
            {bengali
              ? "সহায়তার সময় ফোন বা ইমেইলে নিশ্চিত করুন।"
              : "Please confirm support hours by phone or email."}
          </p>
        </section>
      </div>
      <aside role="note" className="glass-panel contact-note p-6 sm:p-8">
        <p className="max-w-2xl text-base font-medium leading-7 text-foreground">
          {bengali
            ? "এই সাইটে বার্তা পাঠানোর ফরম নেই। সহায়তার অনুরোধ ইমেইল বা ফোনে জানান।"
            : "This site does not provide a contact form. Send support requests by email or phone."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/faq" className="secondary-button text-sm">
            {ui("View frequently asked questions")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/privacy" className="secondary-button text-sm">
            {ui("Read our privacy policy")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
