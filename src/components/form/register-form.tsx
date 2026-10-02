"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "../ui/field";
import { RegisterCustomerZodSchema } from "@/validation";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { useRegistration } from "@/hooks";
import { useRouter } from "next/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { mutate: register, isPending: registerPending } = useRegistration();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "" as string | undefined,
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: RegisterCustomerZodSchema.shape.body as any,
    },
    onSubmit: ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.add({ title: "Validation Error", description: "Passwords do not match", type: "error" });
        return;
      }

      const payload = {
        name: value.name,
        email: value.email,
        contactNumber: value.contactNumber || "",
        password: value.password,
      };

      register(payload, {
        onSuccess: () => {
          toast.add({
            title: "Registration Successful",
            description: "Please check your email for the OTP.",
            type: "success",
          });
          const params = new URLSearchParams({ email: value.email });
          router.push(`/verify-account?${params.toString()}`);
        },
        onError: (err: any) => {
          const errorMessage = err?.data?.message || err?.response?._data?.message || err?.message || "Something went wrong.";
          toast.add({
            title: "Registration Failed",
            description: errorMessage,
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to get started</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="John Doe"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="you@example.com"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="contactNumber">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value || ""}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                        className="pr-10"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Confirm</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <Button disabled={registerPending} type="submit" className="w-full mt-2">
            {registerPending ? (
              <>
                <Spinner className="mr-2" /> Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Login here
        </Link>
      </div>
    </div>
  );
}