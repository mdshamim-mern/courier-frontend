import type { Metadata } from "next";
import LegalDocument from "@/components/layout/legal-document";
import { getLegalDocument } from "@/content/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${getLegalDocument(locale, "terms").title} | Dropzo`,
    robots: { index: false, follow: true },
  };
}

export default function Page() {
  return <LegalDocument kind="terms" />;
}
