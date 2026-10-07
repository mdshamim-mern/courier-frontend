import RegisterForm from "@/components/form/register-form";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/20 p-4">
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-8 dark:border-white/10 dark:bg-white/[0.04]">
        <RegisterForm />
      </div>
    </div>
  );
}