"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useResetPassword } from "@/hooks";
import { AuthValidation } from "@/validation";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Eye, EyeClosed } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Suspense, useEffect, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const form = useForm({
    defaultValues: {
      email: email,
      otp: "",
      newPassword: "",
    },
    validators: {
      onSubmit: AuthValidation.ResetPasswordZodSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      resetPassword(value, {
        onSuccess: () => {
          toast.add({
            title: "Password Reset",
            description: "Your password has been successfully reset. Please login.",
            type: "success",
          });
          router.push("/login");
        },
        onError: (err) => {
          toast.add({
            title: "Reset Failed",
            description: err.message || "Invalid OTP or request failed.",
            type: "error",
          });
        },
      });
    },
  });

  if (!email) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit OTP sent to <span className="font-semibold text-foreground">{email}</span> and your new password.
        </p>
      </div>

      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="otp">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="flex flex-col items-center gap-2">
                  <FieldLabel htmlFor={field.name} className="self-start">OTP Code</FieldLabel>
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                    pattern={REGEXP_ONLY_DIGITS}
                    id={field.name}
                    disabled={isPending}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="rounded-md border h-12 w-10 text-lg" />
                      <InputOTPSlot index={1} className="rounded-md border h-12 w-10 text-lg" />
                      <InputOTPSlot index={2} className="rounded-md border h-12 w-10 text-lg" />
                      <InputOTPSlot index={3} className="rounded-md border h-12 w-10 text-lg" />
                      <InputOTPSlot index={4} className="rounded-md border h-12 w-10 text-lg" />
                      <InputOTPSlot index={5} className="rounded-md border h-12 w-10 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                  {isInvalid && <FieldError errors={field.state.meta.errors} className="self-start" />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
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

          <Button disabled={isPending || form.state.values.otp.length !== 6} type="submit" className="w-full mt-4">
            {isPending ? (
              <>
                <Spinner className="mr-2" /> Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
      <div className="w-full max-w-[440px] rounded-2xl bg-background p-6 sm:p-8 shadow-xl ring-1 ring-border/50 backdrop-blur-md">
        <Suspense
          fallback={
            <div className="flex h-64 w-full items-center justify-center">
              <Spinner className="size-8 text-primary" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
