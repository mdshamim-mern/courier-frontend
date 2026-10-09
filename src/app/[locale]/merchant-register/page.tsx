import ProfileForms from "@/components/operations/profile-forms";
import { useLocale } from "next-intl";
export default function MerchantPage() {
  const bn = useLocale() === "bn";
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-10">
      <h1 className="text-3xl font-bold">
        {bn ? "ব্যবসায়িক নিবন্ধন" : "Business registration"}
      </h1>
      <ProfileForms kind="business" />
    </div>
  );
}
