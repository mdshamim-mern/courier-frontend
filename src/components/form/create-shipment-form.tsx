"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { ShipmentValidation } from "@/validation";
import { useCreateShipment, useGetAllHubs } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface Hub {
  id: string;
  name: string;
  location: string;
  address: string;
}

export default function CreateShipmentForm() {
  const router = useRouter();
  const { mutate: createShipment, isPending } = useCreateShipment();
  const { data: hubsData, isLoading: hubsLoading } = useGetAllHubs({ limit: 100 });
  const hubs = hubsData?.data || [];

  const form = useForm({
    defaultValues: {
      receiverName: "",
      receiverPhone: "",
      receiverAddress: "",
      weight: 1,
      originHubId: "",
      destinationHubId: "",
    },
    validators: {
      onSubmit: ShipmentValidation.CreateShipmentSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      createShipment(value, {
        onSuccess: () => {
          toast.add({
            title: "Shipment Created",
            description: "Your shipment has been created successfully.",
            type: "success",
          });
          router.push("/dashboard/my-shipments");
        },
        onError: (err) => {
          toast.add({
            title: "Creation Failed",
            description: err.message || "Could not create shipment",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Shipment</CardTitle>
        <CardDescription>Enter receiver details and select origin/destination hubs to generate a shipment.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="receiverName">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Receiver Name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Alice Smith"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="receiverPhone">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Receiver Phone</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="receiverAddress">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Detailed Address</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="House, Road, Area, City"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="weight">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Weight (kg)</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="originHubId">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Origin Hub</FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={hubsLoading}
                      >
                        <option value="" disabled>Select origin hub</option>
                        {hubs.map((hub: Hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name} ({hub.location})
                          </option>
                        ))}
                      </select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="destinationHubId">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Destination Hub</FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={hubsLoading}
                      >
                        <option value="" disabled>Select destination hub</option>
                        {hubs.map((hub: Hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name} ({hub.location})
                          </option>
                        ))}
                      </select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <Button type="submit" disabled={isPending} className="w-full mt-4">
              {isPending ? <Spinner className="mr-2" /> : null}
              {isPending ? "Creating..." : "Create Shipment"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
