import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("", params);
}
import ParcelHero from "@/components/home/parcel-hero";
export default function HomePage() {
  return <ParcelHero />;
}
