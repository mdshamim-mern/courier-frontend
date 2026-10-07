"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "../ui/field";
import { LoginZodSchema } from "@/validation";
import { useState } from "react";
import { Eye, EyeClosed, Mail, Lock, ShieldCheck, Truck, UserRound } from "lucide-react";
import { useLogin } from "@/hooks";
import { useRouter } from "next/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginZodSchema.shape.body as any,
    },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: (res) => {
          toast.add({
            title: "Login Successful",
            description: "Welcome back to Dropzo",
            type: "success",
          });
          const role = res.data.role;
          if (role === "ADMIN") router.push("/admin");
          else if (role === "COURIER") router.push("/courier");
          else router.push("/dashboard");
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
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back 👋</h1>
        <p className="text-sm text-muted-foreground">Login to your account to continue</p>
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
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
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
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot Password?
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
                    >
                      {showPassword ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button disabled={loginPending} type="submit" className="w-full shadow-lg shadow-primary/20">
            {loginPending ? (
              <>
                <Spinner className="mr-2" /> Authenticating...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="flex flex-col gap-3 pt-2">
            <div className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              One-Click Demo Login
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setFieldValue("email", "admin@gmail.com");
                  form.setFieldValue("password", "123456");
                }}
                className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
              >
                <ShieldCheck className="size-4 text-primary" /> Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setFieldValue("email", "courier@gmail.com");
                  form.setFieldValue("password", "123456");
                }}
                className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
              >
                <Truck className="size-4 text-primary" /> Courier
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setFieldValue("email", "user@gmail.com");
                  form.setFieldValue("password", "123456");
                }}
                className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
              >
                <UserRound className="size-4 text-primary" /> User
              </Button>
            </div>
          </div>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
          Create Account
        </Link>
      </div>
    </div>
  );
}