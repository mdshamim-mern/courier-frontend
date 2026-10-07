import PaymentStatus from "@/components/modules/payment/payment-status";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ shipmentId?: string }> }) {
  const params = await searchParams;
  const shipmentId = typeof params.shipmentId === "string" && /^[0-9a-f-]{36}$/i.test(params.shipmentId) ? params.shipmentId : "";
  return <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
    <div className="max-w-lg rounded-2xl border bg-card p-8"><PaymentStatus shipmentId={shipmentId} /></div>
  </div>;
}
