import LoginForm from "@/components/form/login-form";
import AuthShell from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}
