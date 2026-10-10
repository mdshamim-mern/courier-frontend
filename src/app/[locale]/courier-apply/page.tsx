import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("courier-apply", params);
}
import ProfileForms from "@/components/operations/profile-forms";
import { useLocale } from "next-intl";
export default function CourierApplyPage() {
  const bn = useLocale() === "bn";
  return (
    <div className="page-wrap max-w-3xl space-y-6">
      <h1 className="page-heading">
        {bn ? "ডেলিভারিকর্মী হিসেবে আবেদন" : "Delivery worker application"}
      </h1>
      <ProfileForms kind="application" />
    </div>
  );
}
