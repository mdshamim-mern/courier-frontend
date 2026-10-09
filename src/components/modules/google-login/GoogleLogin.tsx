"use client";

import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import { GoogleLogin } from "@react-oauth/google";
import { useSearchParams } from "next/navigation";
import { authDestination } from "@/lib/auth-destination";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { mutate: googleLogin, isPending } = useGoogleOAuth();
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
  return (
    <div aria-busy={isPending}>
      <GoogleLogin
        theme="outline"
        shape="pill"
        text="continue_with"
        onSuccess={({ credential }) => {
          if (!credential || isPending) return;
          googleLogin(
            { idToken: credential },
            {
              onSuccess: (result) => {
                const role = result.data.user.role;
                toast.add({ title: "Logged in Successfully", type: "success" });
                router.replace(authDestination(role, next));
              },
              onError: (error) =>
                toast.add({
                  title: "Google Login Failed",
                  description: getApiErrorMessage(error),
                  type: "error",
                }),
            },
          );
        }}
        onError={() =>
          toast.add({ title: "Google Login Failed", type: "error" })
        }
      />
    </div>
  );
}
