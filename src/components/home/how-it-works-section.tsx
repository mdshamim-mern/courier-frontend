import { useLocale } from "next-intl";
export default function HowItWorksSection() {
  const bn = useLocale() === "bn";
  return (
    <section className="px-4 py-8">
      <h2>{bn ? "কাজের ধাপ" : "How it works"}</h2>
      <p>
        {bn
          ? "বুকিং → সংগ্রহের দায়িত্ব → সংগ্রহ → হাব → পথে → ডেলিভারি ও গ্রহণের নথি"
          : "Booking → pickup assignment → collection → hub → transit → delivery and acknowledgment"}
      </p>
    </section>
  );
}
