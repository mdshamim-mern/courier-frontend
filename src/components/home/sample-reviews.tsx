"use client";
import { useLocale } from "next-intl";
import { UserRound, Quote } from "lucide-react";

export default function SampleReviews() {
  const bn = useLocale() === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  return (
    <section
      className="home-sample-reviews"
      aria-labelledby="sample-reviews-title"
    >
      <div className="home-section-heading">
        <div>
          <span className="eyebrow">{t("DEMO FEEDBACK", "ডেমো মতামত")}</span>
          <h2 id="sample-reviews-title">
            {t("Sample customer perspectives", "গ্রাহকের নমুনা অভিজ্ঞতা")}
          </h2>
          <p>
            {t(
              "Illustrative demo content, not verified customer reviews or endorsements. Names are fictional; avatars are placeholders.",
              "এগুলো ডেমো উদাহরণ, যাচাইকৃত গ্রাহকের রিভিউ বা সমর্থন নয়। নামগুলো কাল্পনিক; ছবির জায়গায় নমুনা আইকন।",
            )}
          </p>
        </div>
      </div>
      <div className="home-review-grid">
        {[
          {
            name: t("Demo customer A", "ডেমো গ্রাহক ক"),
            text: t(
              "Seeing the delivery charge before confirming makes the booking steps easier to follow.",
              "নিশ্চিত করার আগে ডেলিভারি মাশুল দেখলে বুকিংয়ের ধাপগুলো বুঝতে সুবিধা হয়।",
            ),
          },
          {
            name: t("Demo customer B", "ডেমো গ্রাহক খ"),
            text: t(
              "The tracking timeline puts recorded parcel updates together in one place.",
              "অনুসন্ধানের ঘটনাপঞ্জিতে পার্সেলের নথিভুক্ত আপডেট এক জায়গায় দেখা যায়।",
            ),
          },
          {
            name: t("Demo merchant C", "ডেমো ব্যবসায়ী গ"),
            text: t(
              "Keeping delivery fees and product cash collections separate makes the records clearer.",
              "ডেলিভারি মাশুল ও পণ্যের টাকা সংগ্রহ আলাদা থাকলে হিসাব পরিষ্কার বোঝা যায়।",
            ),
          },
        ].map(({ name, text }) => (
          <article className="glass-panel home-review-card" key={name}>
            <span className="sample-review-badge">
              {t("Sample review · Demo", "নমুনা মতামত · ডেমো")}
            </span>
            <Quote aria-hidden="true" size={23} />
            <blockquote>{text}</blockquote>
            <div>
              <span className="sample-avatar" aria-hidden="true">
                <UserRound size={22} />
              </span>
              <strong>{name}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
