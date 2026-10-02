import ShipmentHistory from "@/components/modules/customer/shipment-history";

export default function MyShipmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">My Shipments</h1>
        <p className="text-sm text-muted-foreground">
          View and track all your active and past shipments.
        </p>
      </div>
      <ShipmentHistory />
    </div>
  );
}