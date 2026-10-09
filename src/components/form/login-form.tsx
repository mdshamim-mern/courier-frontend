"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { LoginZodSchema } from "@/validation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authDestination } from "@/lib/auth-destination";
import {
  Eye,
  EyeClosed,
  Mail,
  Lock,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { useLogin } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { Link } from "@/i18n/navigation";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";

export default function LoginForm() {
  const ui = useUiText();
  const next = useSearchParams().get("next");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginZodSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["user"] });
          toast.add({
            title: "Login Successful",
            description: "Welcome back to Dropzo",
            type: "success",
          });
          const role = res.data.user.role;
          router.push(authDestination(role, next));
        },
        onError: (err) => {
          toast.add({
            title: "Authentication Failed",
            description: err.message || "Invalid email or password",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
          <Lock className="size-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {ui("Welcome Back 👋")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Login to your account to continue")}
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
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {ui("Email Address")}
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      autoComplete="email"
                      aria-invalid={isInvalid}
                      className="pl-10"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>
                      {ui("Password")}
                    </FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {ui("Forgot Password?")}{" "}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      autoComplete="current-password"
                      aria-invalid={isInvalid}
                      className="pl-10 pr-10"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={ui(
                        showPassword ? "Hide password" : "Show password",
                      )}
                    >
                      {showPassword ? (
                        <EyeClosed className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button
            disabled={loginPending}
            type="submit"
            className="w-full shadow-lg shadow-primary/20"
          >
            {loginPending ? (
              <>
                <Spinner className="mr-2" /> {ui("Authenticating...")}{" "}
              </>
            ) : (
              ui("Login")
            )}
          </Button>

          {process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true" && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {ui("One-Click Demo Login")}{" "}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setFieldValue("email", "admin@courier.com");
                    form.setFieldValue("password", "Admin@12345");
                  }}
                  className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
                >
                  <ShieldCheck className="size-4 text-primary" /> {ui(
                    "Admin",
                  )}{" "}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setFieldValue("email", "courier@courier.com");
                    form.setFieldValue("password", "Courier@1234");
                  }}
                  className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
                >
                  <Truck className="size-4 text-primary" /> {ui("Courier")}{" "}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setFieldValue("email", "customer@courier.com");
                    form.setFieldValue("password", "Customer@1234");
                  }}
                  className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
                >
                  <UserRound className="size-4 text-primary" /> {ui(
                    "User",
                  )}{" "}
                </Button>
              </div>
            </div>
          )}
        </FieldGroup>
      </form>

      <FieldSeparator>{ui("Or continue with")}</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-2">
        {ui("Don't have an account?")}{" "}
        <Link
          href={
            "/register?next=" +
            encodeURIComponent(authDestination("CUSTOMER", next))
          }
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          {ui("Create Account")}{" "}
        </Link>
      </div>
    </div>
  );
}
