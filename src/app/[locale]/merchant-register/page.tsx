import ProfileForms from "@/components/operations/profile-forms";
import { useLocale } from "next-intl";
export default function MerchantPage() {
  const bn = useLocale() === "bn";
  return (
    <div className="page-wrap max-w-3xl space-y-6">
      <h1 className="page-heading">
        {bn ? "ব্যবসায়িক নিবন্ধন" : "Business registration"}
      </h1>
      <ProfileForms kind="business" />
    </div>
  );
}
