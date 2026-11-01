import CoverageDetail from "@/components/operations/coverage-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CoverageDetail id={id} />;
}
