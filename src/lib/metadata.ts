import type { Metadata } from "next";

export const publicPages = {
  "": [
    "Send a parcel",
    "পার্সেল পাঠান",
    "Book pickup, check approved delivery costs and follow your Dropzo parcel.",
    "সংগ্রহের বুকিং, অনুমোদিত মাশুল ও ড্রপজো পার্সেলের অবস্থা জানুন।",
  ],
  about: [
    "About Dropzo",
    "ড্রপজো সম্পর্কে",
    "Understand Dropzo's delivery team, hub network, tracking and cash collection workflow.",
    "ড্রপজোর কর্মী, হাব, অনুসরণ ও নগদ সংগ্রহের প্রক্রিয়া জানুন।",
  ],
  contact: [
    "Contact Dropzo",
    "ড্রপজোর সঙ্গে যোগাযোগ",
    "Contact Dropzo by email or phone for booking and delivery support.",
    "বুকিং ও ডেলিভারির সহায়তায় ড্রপজোকে ফোন বা ইমেইল করুন।",
  ],
  pricing: [
    "Delivery cost",
    "ডেলিভারির মাশুল",
    "Calculate approved route, weight, pickup and COD charges before booking.",
    "বুকিংয়ের আগে অনুমোদিত রুট, ওজন, সংগ্রহ ও নগদ সংগ্রহের মাশুল হিসাব করুন।",
  ],
  coverage: [
    "Service coverage",
    "সেবার এলাকা",
    "Search approved pickup, branch drop-off and delivery areas in Bangladesh.",
    "বাংলাদেশে অনুমোদিত সংগ্রহ, হাবে জমা ও ডেলিভারির এলাকা খুঁজুন।",
  ],
  services: [
    "Our Services",
    "আমাদের সেবাসমূহ",
    "Explore route-based delivery, merchant pickups and parcel tracking with Dropzo.",
    "ড্রপজোর রুটভিত্তিক ডেলিভারি, ব্যবসায়িক সংগ্রহ ও পার্সেল অনুসরণ জানুন।",
  ],
  "merchant-register": [
    "Business registration",
    "ব্যবসায়িক নিবন্ধন",
    "Apply for a reviewed business account for COD bookings and manual settlement records.",
    "পণ্যের টাকা সংগ্রহের বুকিং ও ম্যানুয়াল হিসাবের জন্য ব্যবসায়িক আবেদন করুন।",
  ],
  "courier-apply": [
    "Join the delivery team",
    "ডেলিভারিকর্মী দলে যোগ দিন",
    "Submit a delivery worker application for administrator review and hub assignment.",
    "প্রশাসকের যাচাই ও হাব বরাদ্দের জন্য ডেলিভারিকর্মীর আবেদন করুন।",
  ],
  "track-shipment": [
    "Track your parcel",
    "পার্সেল অনুসরণ করুন",
    "Find a parcel's recorded status and timeline using its tracking number.",
    "অনুসন্ধানসংখ্যা দিয়ে পার্সেলের নথিভুক্ত অবস্থা ও সময়রেখা দেখুন।",
  ],
  faq: [
    "Frequently Asked Questions",
    "সাধারণ প্রশ্ন ও উত্তর",
    "Answers about booking, tracking, account access, payment verification and COD.",
    "বুকিং, অনুসরণ, অ্যাকাউন্ট, পেমেন্ট যাচাই ও নগদ সংগ্রহের উত্তর।",
  ],
  terms: [
    "Terms of Service",
    "ব্যবহারের শর্তাবলি",
    "Dropzo evaluation terms, booking responsibilities and operational limitations.",
    "ড্রপজোর মূল্যায়নকালীন শর্ত, বুকিংয়ের দায়িত্ব ও কার্যক্রমের সীমা।",
  ],
  privacy: [
    "Privacy Policy",
    "গোপনীয়তার নীতি",
    "How the evaluation platform processes account, parcel, payment and security records.",
    "মূল্যায়নকালীন প্ল্যাটফর্মে অ্যাকাউন্ট, পার্সেল, পেমেন্ট ও নিরাপত্তার তথ্যের ব্যবহার।",
  ],
  cookies: [
    "Cookie Policy",
    "কুকির নীতি",
    "Session cookies, language preferences and provider interactions in Dropzo.",
    "ড্রপজোর সেশন কুকি, ভাষার পছন্দ ও বাহ্যিক সেবার ব্যবহার।",
  ],
} as const;

export async function pageMetadata(
  path: keyof typeof publicPages,
  params: Promise<{ locale: string }>,
): Promise<Metadata> {
  const { locale } = await params;
  const copy = publicPages[path];
  const title = `${copy[locale === "bn" ? 1 : 0]} | Dropzo`;
  const description = copy[locale === "bn" ? 3 : 2];
  const base =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    "https://courier-frontend-sigma.vercel.app";
  const url = `${base}/${locale}${path ? `/${path}` : ""}`;
  return {
    robots: ["terms", "privacy", "cookies"].includes(path)
      ? { index: false, follow: true }
      : undefined,
    title,
    description,
    metadataBase: new URL(base),
    alternates: {
      canonical: url,
      languages: {
        en: `${base}/en${path ? `/${path}` : ""}`,
        bn: `${base}/bn${path ? `/${path}` : ""}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Dropzo",
      locale: locale === "bn" ? "bn_BD" : "en_US",
      type: "website",
      images: [{ url: `${base}/${locale}/opengraph-image`, width: 1200, height: 630, alt: "Dropzo parcel delivery" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${base}/${locale}/opengraph-image`] },
  };
}
