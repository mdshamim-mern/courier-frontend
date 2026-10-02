"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "../ui/field";
import { LoginZodSchema } from "@/validation";
import { useState } from "react";
import { Eye, EyeClosed, ShieldCheck, Truck, User } from "lucide-react";
import { useLogin } from "@/hooks";
import { useRouter } from "next/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";
import { UserRole } from "@/types";

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
            description: "Welcome back to PH Courier",
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

  const handleDemoLogin = (role: UserRole) => {
    const credentials = {
      ADMIN: { email: "admin@courier.com", password: "Admin@12345" },
      COURIER: { email: "courier@courier.com", password: "Courier@1234" },
      CUSTOMER: { email: "customer@courier.com", password: "Customer@1234" },
    };
    
    form.setFieldValue("email", credentials[role].email);
    form.setFieldValue("password", credentials[role].password);
    
    login(credentials[role], {
      onSuccess: () => {
        toast.add({
          title: "Demo Login Successful",
          description: `Logged in as ${role}`,
          type: "success",
        });
        if (role === "ADMIN") router.push("/admin");
        else if (role === "COURIER") router.push("/courier");
        else router.push("/dashboard");
      },
      onError: (err) => {
        toast.add({
          title: "Demo Login Failed",
          description: err.message || "Could not login with demo credentials",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
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
                  />
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

          <Button disabled={loginPending} type="submit" className="w-full">
            {loginPending ? (
              <>
                <Spinner className="mr-2" /> Authenticating...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>🚀 Quick Demo Login</FieldSeparator>

      <div className="grid grid-cols-3 gap-3">
        <Button 
          type="button" 
          variant="outline" 
          disabled={loginPending} 
          onClick={() => handleDemoLogin("ADMIN")}
          className="flex flex-col items-center py-6 h-auto gap-2"
        >
          <ShieldCheck className="size-5" />
          <span className="text-xs">Admin</span>
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          disabled={loginPending} 
          onClick={() => handleDemoLogin("COURIER")}
          className="flex flex-col items-center py-6 h-auto gap-2"
        >
          <Truck className="size-5" />
          <span className="text-xs">Courier</span>
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          disabled={loginPending} 
          onClick={() => handleDemoLogin("CUSTOMER")}
          className="flex flex-col items-center py-6 h-auto gap-2"
        >
          <User className="size-5" />
          <span className="text-xs">Customer</span>
        </Button>
      </div>

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