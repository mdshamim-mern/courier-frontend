import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("pricing", params);
}
import QuoteCalculator from "@/components/operations/quote-calculator";
export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <QuoteCalculator />
    </div>
  );
}
