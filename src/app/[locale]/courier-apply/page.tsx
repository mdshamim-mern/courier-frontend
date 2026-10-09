import ProfileForms from "@/components/operations/profile-forms";
import { useLocale } from "next-intl";
export default function CourierApplyPage() {
  const bn = useLocale() === "bn";
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-10">
      <h1 className="text-3xl font-bold">
        {bn ? "ডেলিভারিকর্মী হিসেবে আবেদন" : "Delivery worker application"}
      </h1>
      <ProfileForms kind="application" />
    </div>
  );
}
