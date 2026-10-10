import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("about", params);
}
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  House,
  MapPin,
  PackageCheck,
  Route,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./about.module.css";

export default function AboutPage() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const journey = [
    {
      icon: House,
      en: "Your address",
      bn: "আপনার ঠিকানা",
      detail: "Pickup or branch drop-off",
      detailBn: "ঠিকানা থেকে সংগ্রহ বা শাখায় জমা",
    },
    {
      icon: Building2,
      en: "Dropzo hubs",
      bn: "Dropzo হাব",
      detail: "A route assigned by our team",
      detailBn: "আমাদের দলের নির্ধারিত পথ",
    },
    {
      icon: PackageCheck,
      en: "The receiver",
      bn: "প্রাপক",
      detail: "Delivery with acknowledgment",
      detailBn: "গ্রহণের নথিসহ ডেলিভারি",
    },
  ];
  const steps = [
    {
      icon: PackageCheck,
      en: "Book your parcel",
      bn: "পার্সেল বুকিং",
      description:
        "Choose addresses, review the approved cost and confirm your booking.",
      descriptionBn: "ঠিকানা দিন, অনুমোদিত মাশুল দেখুন এবং বুকিং নিশ্চিত করুন।",
    },
    {
      icon: ShieldCheck,
      en: "Pickup assignment",
      bn: "সংগ্রহের দায়িত্ব",
      description:
        "An administrator assigns the pickup work to an approved delivery worker.",
      descriptionBn: "প্রশাসক অনুমোদিত ডেলিভারিকর্মীকে সংগ্রহের কাজ বরাদ্দ করেন।",
    },
    {
      icon: House,
      en: "Parcel collection",
      bn: "পার্সেল সংগ্রহ",
      description:
        "Your parcel is collected from the approved area or received at the assigned branch.",
      descriptionBn: "চালু এলাকা থেকে পার্সেল সংগ্রহ বা নির্ধারিত শাখায় জমা নেওয়া হয়।",
    },
    {
      icon: Route,
      en: "Hub & transit",
      bn: "হাব ও পরিবহন",
      description:
        "The parcel moves through its origin hub, route and destination hub.",
      descriptionBn: "পার্সেল সংগ্রহের হাব, নির্ধারিত পথ ও গন্তব্যের হাব দিয়ে যায়।",
    },
    {
      icon: Truck,
      en: "Delivery",
      bn: "ডেলিভারি",
      description:
        "Delivery is recorded with recipient acknowledgment and the delivery time.",
      descriptionBn: "প্রাপকের গ্রহণের নথি ও সময়সহ ডেলিভারি নথিভুক্ত হয়।",
    },
    {
      icon: Wallet,
      en: "Separate COD ledger",
      bn: "পণ্যের টাকার পৃথক হিসাব",
      description:
        "For approved businesses, collected product money and manual remittances have a separate ledger.",
      descriptionBn:
        "অনুমোদিত ব্যবসার পণ্যের টাকা সংগ্রহ ও ম্যানুয়াল হস্তান্তরের পৃথক হিসাব থাকে।",
    },
  ];
  const principles = [
    {
      icon: Route,
      en: "What tracking shows",
      bn: "অনুসরণে যা দেখবেন",
      description:
        "Tracking displays recorded status and timestamps, not a worker's live GPS location.",
      descriptionBn:
        "অনুসরণে নথিভুক্ত অবস্থা ও সময় দেখা যাবে; কর্মীর সরাসরি জিপিএস অবস্থান নয়।",
      link: "/track-shipment",
      action: "Track a parcel",
      actionBn: "পার্সেল অনুসরণ",
      dark: true,
    },
    {
      icon: Wallet,
      en: "Business payments",
      bn: "ব্যবসায়ীর টাকার হিসাব",
      description:
        "Delivery charges are paid separately. Product cash collections and administrator-confirmed remittances have their own ledger.",
      descriptionBn:
        "ডেলিভারি মাশুল আলাদা পরিশোধযোগ্য। পণ্যের টাকা সংগ্রহ ও প্রশাসকের নিশ্চিত করা টাকা হস্তান্তরের পৃথক হিসাব থাকবে।",
      link: "/merchant-register",
      action: "For your business",
      actionBn: "আপনার ব্যবসার জন্য",
      dark: false,
    },
    {
      icon: ShieldCheck,
      en: "Service commitments",
      bn: "সেবার প্রতিশ্রুতি",
      description:
        "Coverage, charges and estimated delivery time depend on approved route settings. Confirm support hours with our contact team.",
      descriptionBn:
        "অনুমোদিত রুটের সেটিং অনুযায়ী এলাকা, মাশুল ও সম্ভাব্য সময় নির্ধারিত হবে। সহায়তার সময় যোগাযোগ করে নিশ্চিত করুন।",
      link: "/coverage",
      action: "Check service coverage",
      actionBn: "সেবার এলাকা যাচাই",
      dark: false,
    },
  ];
  return (
    <article
      className={["page-wrap", styles.page, bn ? styles.bengali : ""].join(" ")}
    >
      <section
        className={["glass-panel", styles.hero].join(" ")}
        aria-labelledby="about-title"
      >
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            {t("BUILT AROUND YOUR PARCEL", "আপনার পার্সেলকে ঘিরেই আমাদের সেবা")}
          </p>
          <h1 id="about-title" className={styles.title}>
            {t("About Dropzo", "ড্রপজো সম্পর্কে")}
          </h1>
          <p className={styles.tagline}>
            {t(
              "A clear journey. From your door to theirs.",
              "আপনার দরজা থেকে প্রাপকের দরজা—প্রতিটি ধাপ পরিষ্কার।",
            )}
          </p>
          <p className={styles.description}>
            {t(
              "Dropzo uses its own approved delivery workers. Customers book a parcel; administrators assign pickup, route hubs and delivery work.",
              "ড্রপজো নিজের অনুমোদিত ডেলিভারিকর্মীদের দিয়ে পার্সেল সংগ্রহ ও পৌঁছে দেবে। গ্রাহক বুকিং করবেন; প্রশাসক সংগ্রহের দায়িত্ব, রুটের হাব ও ডেলিভারির কাজ বরাদ্দ করবেন।",
            )}
          </p>
          <div className={styles.heroActions}>
            <Link className="brand-button" href="/dashboard/new-shipment">
              {t("Send a parcel", "পার্সেল পাঠান")}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link className={styles.textLink} href="/coverage">
              {t("Explore our coverage", "সেবার এলাকা দেখুন")}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ul className={styles.trustNotes}>
            <li>
              <ShieldCheck size={16} aria-hidden="true" />
              {t("Approved delivery team", "অনুমোদিত ডেলিভারিকর্মী")}
            </li>
            <li>
              <Clock3 size={16} aria-hidden="true" />
              {t("Recorded status updates", "নথিভুক্ত অবস্থার খবর")}
            </li>
          </ul>
        </div>
        <section
          className={styles.routePanel}
          aria-labelledby="about-route-title"
        >
          <div className={styles.routeHeading}>
            <span className={styles.routeBrand}>
              <PackageCheck size={22} aria-hidden="true" />
              Dropzo
            </span>
            <span className={styles.routePill}>
              {t("THE JOURNEY", "পার্সেলের যাত্রা")}
            </span>
          </div>
          <h2 id="about-route-title">
            {t("From pickup to delivery", "সংগ্রহ থেকে ডেলিভারি")}
          </h2>
          <ol className={styles.routeList}>
            {journey.map(
              ({ icon: Icon, en, bn: bangla, detail, detailBn }, index) => (
                <li className={styles.routeNode} key={en}>
                  <span className={styles.routeIcon}>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{t(en, bangla)}</h3>
                    <p>{t(detail, detailBn)}</p>
                  </div>
                  {index !== journey.length - 1 && (
                    <ArrowDown
                      className={styles.routeArrow}
                      size={15}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ),
            )}
          </ol>
          <p className={styles.routeCaption}>
            <MapPin size={15} aria-hidden="true" />
            {t(
              "Process overview, not live parcel tracking.",
              "এটি কাজের ধাপচিত্র, সরাসরি পার্সেল অনুসরণ নয়।",
            )}
          </p>
        </section>
      </section>

      <section className={styles.process} aria-labelledby="about-process-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionLabel}>
              {t("A CONNECTED PROCESS", "একটি ধারাবাহিক প্রক্রিয়া")}
            </p>
            <h2 id="about-process-title">
              {t("Our service process", "আমাদের কাজের ধাপ")}
            </h2>
          </div>
          <p>
            {t(
              "You provide the addresses. Our team manages the route and responsibility at every stage.",
              "আপনি ঠিকানা দেবেন। আমাদের দল প্রতিটি ধাপের পথ ও দায়িত্ব নির্ধারণ করবে।",
            )}
          </p>
        </div>
        <ol className={styles.stepGrid}>
          {steps.map(
            (
              { icon: Icon, en, bn: bangla, description, descriptionBn },
              index,
            ) => (
              <li
                className={["glass-panel", styles.stepCard].join(" ")}
                key={en}
              >
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>
                    {new Intl.NumberFormat(bn ? "bn-BD" : "en-US", {
                      minimumIntegerDigits: 2,
                    }).format(index + 1)}
                  </span>
                  <Icon size={21} aria-hidden="true" />
                </div>
                <h3>{t(en, bangla)}</h3>
                <p>{t(description, descriptionBn)}</p>
              </li>
            ),
          )}
        </ol>
      </section>

      <section
        className={styles.principles}
        aria-labelledby="about-principles-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionLabel}>
              {t("CLARITY BEFORE COMMITMENT", "শুরু করার আগেই পরিষ্কার তথ্য")}
            </p>
            <h2 id="about-principles-title">
              {t("Know what to expect", "কী সেবা পাবেন, জেনে নিন")}
            </h2>
          </div>
        </div>
        <div className={styles.principleGrid}>
          {principles.map(
            ({
              icon: Icon,
              en,
              bn: bangla,
              description,
              descriptionBn,
              link,
              action,
              actionBn,
              dark,
            }) => (
              <section
                className={[
                  "glass-panel",
                  styles.principleCard,
                  dark ? styles.darkCard : "",
                ].join(" ")}
                key={en}
              >
                <span className={styles.principleIcon}>
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3>{t(en, bangla)}</h3>
                <p>{t(description, descriptionBn)}</p>
                <Link className={styles.cardLink} href={link}>
                  {t(action, actionBn)}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </section>
            ),
          )}
        </div>
      </section>

      <section
        className={["glass-panel", styles.cta].join(" ")}
        aria-labelledby="about-start-title"
      >
        <div className={styles.ctaCopy}>
          <span className={styles.ctaIcon}>
            <CheckCircle2 size={26} aria-hidden="true" />
          </span>
          <div>
            <h2 id="about-start-title">
              {t("Start with the right information.", "সঠিক তথ্য দিয়ে শুরু করুন।")}
            </h2>
            <p>
              {t(
                "Check the service area and approved charges before you book.",
                "বুকিংয়ের আগে সেবার এলাকা ও অনুমোদিত মাশুল যাচাই করুন।",
              )}
            </p>
          </div>
        </div>
        <nav
          className={styles.ctaActions}
          aria-label={t("Explore Dropzo services", "Dropzo সেবা দেখুন")}
        >
          <Link className="brand-button" href="/pricing">
            {t("Calculate charges", "খরচ হিসাব")}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link className="secondary-button" href="/contact">
            {t("Contact support", "সহায়তার যোগাযোগ")}
          </Link>
        </nav>
      </section>
    </article>
  );
}
