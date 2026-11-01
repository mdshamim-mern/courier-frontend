import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
export default function MoreSections() {
  const bn = useLocale() === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  return (
    <>
      <section className="space-y-5">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">{t("OUR SERVICES", "আমাদের সেবা")}</p>
            <h2>
              {t("Delivery that fits your parcel", "আপনার পার্সেলের উপযোগী সেবা")}
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "standard-delivery",
              "Standard delivery",
              "সাধারণ ডেলিভারি",
              "Check approved routes and delivery estimates.",
              "অনুমোদিত রুট ও সম্ভাব্য সময় দেখুন।",
            ],
            [
              "express-delivery",
              "Express delivery",
              "জরুরি ডেলিভারি",
              "Choose express where an approved rate is available.",
              "অনুমোদিত মাশুল থাকলে জরুরি সেবা নিন।",
            ],
            [
              "corporate-logistics",
              "Business parcels",
              "ব্যবসায়িক পার্সেল",
              "Book individual parcels or validated CSV batches.",
              "একক পার্সেল বা সিএসভি ব্যাচ বুক করুন।",
            ],
            [
              "cash-on-delivery",
              "Cash collections",
              "পণ্যের টাকা সংগ্রহ",
              "Track product COD separately from delivery fees.",
              "ডেলিভারি মাশুলের বাইরে পণ্যের টাকার হিসাব দেখুন।",
            ],
          ].map(([id, title, titleBn, body, bodyBn]) => (
            <article key={id} className="glass-panel flex flex-col gap-4 p-6">
              <h3 className="text-xl font-semibold">{t(title, titleBn)}</h3>
              <p className="grow text-muted-foreground">{t(body, bodyBn)}</p>
              <Link href={`/services/${id}`} className="text-link">
                {t("View Details", "বিস্তারিত দেখুন")} ↗
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="glass-panel space-y-5 p-6 sm:p-8">
        <p className="eyebrow">{t("FOR YOUR BUSINESS", "আপনার ব্যবসার জন্য")}</p>
        <h2 className="text-2xl font-bold">
          {t(
            "Keep bookings and collections together",
            "বুকিং ও সংগ্রহের হিসাব এক জায়গায়",
          )}
        </h2>
        <p>
          {t(
            "Apply for a business account, save pickup details, upload parcel batches and follow recorded COD collections. Administrator approval is required before COD bookings.",
            "ব্যবসায়িক হিসাবের আবেদন, সংগ্রহের তথ্য সংরক্ষণ, একসঙ্গে পার্সেল বুকিং ও নথিভুক্ত পণ্যের টাকা অনুসরণ করুন। COD বুকিংয়ের আগে প্রশাসকের অনুমোদন লাগে।",
          )}
        </p>
        <Link className="secondary-button" href="/merchant-register">
          {t("Register your business", "ব্যবসায়িক নিবন্ধন")} ↗
        </Link>
      </section>
      <section className="space-y-5">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">
              {t("HELP WITH YOUR DELIVERY", "ডেলিভারির সহায়তা")}
            </p>
            <h2>{t("Frequently asked questions", "সাধারণ প্রশ্নের উত্তর")}</h2>
          </div>
        </div>
        {[
          [
            "How do I check the delivery fee?",
            "ডেলিভারি মাশুল কীভাবে দেখব?",
            "Use the calculator with your pickup area, delivery area, weight and service. The server checks final pricing when you book.",
            "সংগ্রহ ও ডেলিভারির এলাকা, ওজন এবং সেবা দিয়ে হিসাব করুন। বুকিংয়ের সময় সার্ভার চূড়ান্ত মাশুল যাচাই করে।",
          ],
          [
            "Is product COD the delivery fee?",
            "পণ্যের COD কি ডেলিভারি মাশুল?",
            "The delivery fee is paid online; product COD is the amount collected from the receiver for an approved business.",
            "ডেলিভারি মাশুল অনলাইনে পরিশোধ হয়। অনুমোদিত ব্যবসার পণ্যের মূল্য প্রাপকের কাছ থেকে সংগ্রহ করা হয়।",
          ],
          [
            "Can I track without signing in?",
            "প্রবেশ না করেও কি অনুসরণ করা যায়?",
            "Yes. Enter the tracking ID on the public tracking page to view recorded progress. Receiver contact details stay private.",
            "হ্যাঁ। প্রকাশ্য অনুসন্ধানের পাতায় অনুসন্ধানসংখ্যা দিয়ে নথিভুক্ত অগ্রগতি দেখুন। প্রাপকের যোগাযোগের তথ্য গোপন থাকে।",
          ],
        ].map(([q, qb, a, ab]) => (
          <details className="glass-panel p-5" key={q}>
            <summary className="cursor-pointer font-semibold">
              {t(q, qb)}
            </summary>
            <p className="mt-4 text-muted-foreground">{t(a, ab)}</p>
          </details>
        ))}
        <Link href="/contact" className="text-link">
          {t("Contact support", "সহায়তায় যোগাযোগ")} ↗
        </Link>
      </section>
      <section className="glass-panel space-y-4 p-6">
        <p className="eyebrow">{t("BEFORE YOU BOOK", "বুকিংয়ের আগে")}</p>
        <h2 className="text-2xl font-bold">
          {t("Prepare your parcel", "পার্সেল প্রস্তুত করুন")}
        </h2>
        <ol className="grid list-inside list-decimal gap-4 md:grid-cols-3">
          <li>
            {t(
              "Use a strong box and cushioning for fragile items.",
              "ভঙ্গুর পণ্যের জন্য মজবুত বাক্স ও সুরক্ষিত মোড়ক দিন।",
            )}
          </li>
          <li>
            {t(
              "Check the pickup address and receiver contact details.",
              "সংগ্রহের ঠিকানা ও প্রাপকের যোগাযোগের তথ্য যাচাই করুন।",
            )}
          </li>
          <li>
            {t(
              "Keep your tracking ID for updates and support.",
              "আপডেট ও সহায়তার জন্য অনুসন্ধানসংখ্যা রাখুন।",
            )}
          </li>
        </ol>
        <Link href="/faq" className="text-link">
          {t("More booking guidance", "বুকিংয়ের আরও নির্দেশনা")} ↗
        </Link>
      </section>
    </>
  );
}
