"use client";
import { ProfileSchema } from "@/validation/operations.validation";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";
import { SchemaForm } from "@/components/form/schema-form";
import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateMyProfile } from "@/hooks";
import { useEffect, useState, useId } from "react";

export default function CustomerProfilePage() {
  const ui = useUiText();
  const formId = useId();
  const { data, isLoading, isError, refetch } = useGetMe();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name || "");
      setContactNumber(data.data.contactNumber || "");
      setAddress(data.data.customer?.address || "");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile(
      ProfileSchema.parse(Object.fromEntries(new FormData(e.currentTarget))),
      {
        onSuccess: () =>
          toast.add({ title: "Profile Updated", type: "success" }),
        onError: (err) =>
          toast.add({
            title: "Update Failed",
            description: err.message,
            type: "error",
          }),
      },
    );
  };

  if (isError)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );
  if (isLoading) {
    return <DataSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("My Profile")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Manage your personal information and settings.")}
        </p>
      </div>
      <Card className="max-w-xl shadow-sm border-muted/20">
        <CardHeader>
          <CardTitle>{ui("Profile Details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SchemaForm
            schema={ProfileSchema}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Field>
              <FieldLabel htmlFor={`${formId}-name`}>
                {ui("Full Name")}
              </FieldLabel>
              <Input
                id={`${formId}-name`}
                name="name"
                autoComplete="name"
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-email`}>
                {ui("Email Address")}
              </FieldLabel>
              <Input
                id={`${formId}-email`}
                value={data?.data?.email || ""}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-phone`}>
                {ui("Contact Number")}
              </FieldLabel>
              <Input
                id={`${formId}-phone`}
                name="contactNumber"
                type="tel"
                autoComplete="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-address`}>
                {ui("Default Address")}
              </FieldLabel>
              <Input
                id={`${formId}-address`}
                name="address"
                autoComplete="street-address"
                maxLength={500}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={ui("House, Street, City")}
              />
            </Field>
            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full sm:w-auto"
            >
              {isPending ? <Spinner className="mr-2" /> : null}
              {ui("Save Changes")}{" "}
            </Button>
          </SchemaForm>
        </CardContent>
      </Card>
    </div>
  );
}
