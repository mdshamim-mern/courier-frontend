import { useLocale } from "next-intl";
export default function FeaturesSection() {
  const bn = useLocale() === "bn";
  return (
    <section className="px-4 py-8">
      <h2>
        {bn
          ? "নিজস্ব কর্মী, অনুমোদিত রুট ও নথিভুক্ত অনুসরণ"
          : "Own delivery team, approved routes and recorded tracking"}
      </h2>
    </section>
  );
}
