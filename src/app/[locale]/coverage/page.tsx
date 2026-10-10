import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("coverage", params);
}
import CoverageList from "@/components/operations/coverage-list";

export default function CoveragePage() {
  return <CoverageList />;
}
