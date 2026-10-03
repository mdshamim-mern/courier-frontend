import LoginForm from "@/components/form/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 sm:p-8 shadow-xl ring-1 ring-border/50">
        <LoginForm />
      </div>
    </div>
  );
}