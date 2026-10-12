import RegisterForm from "@/components/form/register-form";
import AuthShell from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
