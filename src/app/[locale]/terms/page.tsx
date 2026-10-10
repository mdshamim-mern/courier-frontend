import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("terms", params);
}
import LegalDocument from "@/components/layout/legal-document";

export default function Page() {
  return <LegalDocument kind="terms" />;
}
