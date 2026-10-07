"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useForgotPassword } from "@/hooks";
import { AuthValidation } from "@/validation";
import { useForm } from "@tanstack/react-form";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
  const ui = useUiText();
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: AuthValidation.ForgotPasswordZodSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      forgotPassword(value, {
        onSuccess: () => {
          toast.add({
            title: "OTP Sent",
            description: "Check your email for the reset instructions.",
            type: "success",
          });
          const params = new URLSearchParams({ email: value.email });
          router.push(`/reset-password?${params.toString()}`);
        },
        onError: (err) => {
          toast.add({
            title: "Request Failed",
            description: err.message || "Could not process request.",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
      <div className="w-full max-w-[440px] rounded-2xl bg-background p-6 sm:p-8 shadow-xl ring-1 ring-border/50 backdrop-blur-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {ui("Forgot Password")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ui(
                "Enter your email address and we will send you a code to reset your password.",
              )}{" "}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {ui("Email Address")}
                      </FieldLabel>
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
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full mt-2"
              >
                {isPending ? (
                  <>
                    <Spinner className="mr-2" /> {ui("Sending OTP...")}{" "}
                  </>
                ) : (
                  ui("Send Reset OTP")
                )}
              </Button>
            </FieldGroup>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-2">
            {ui("Remember your password?")}{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              {ui("Back to Login")}{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
