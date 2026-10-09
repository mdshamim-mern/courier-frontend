import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
export default function StatsSection() {
  const bn = useLocale() === "bn";
  return (
    <section className="px-4 py-8">
      <Link href="/coverage" className="underline">
        {bn ? "বাস্তব অনুমোদিত সেবার এলাকা দেখুন" : "View approved service coverage"}
      </Link>
    </section>
  );
}
