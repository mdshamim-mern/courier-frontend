"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateMyProfile } from "@/hooks";
import { useEffect, useState } from "react";

export default function CustomerProfilePage() {
  const { data, isLoading } = useGetMe();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, contactNumber, address },
      {
        onSuccess: () => toast.add({ title: "Profile Updated", type: "success" }),
        onError: (err) => toast.add({ title: "Update Failed", description: err.message, type: "error" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and settings.</p>
      </div>
      <Card className="max-w-xl shadow-sm border-muted/20">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>Full Name</FieldLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input value={data?.data?.email || ""} disabled className="bg-muted/50 cursor-not-allowed" />
            </Field>
            <Field>
              <FieldLabel>Contact Number</FieldLabel>
              <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Default Address</FieldLabel>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, Street, City" />
            </Field>
            <Button type="submit" disabled={isPending} className="mt-4 w-full sm:w-auto">
              {isPending ? <Spinner className="mr-2" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}