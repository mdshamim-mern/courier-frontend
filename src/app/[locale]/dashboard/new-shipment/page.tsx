import { useUiText } from "@/i18n/use-ui-text";
import CreateShipmentForm from "@/components/form/create-shipment-form";

export default function NewShipmentPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("New Shipment")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "Fill in the details below to create a new delivery request.",
          )}{" "}
        </p>
      </div>
      <CreateShipmentForm />
    </div>
  );
}
