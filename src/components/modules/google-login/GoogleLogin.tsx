"use client";

import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const { mutate: googleLogin } = useGoogleOAuth();

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google OAuth Failed",
        description: "Something went wrong. Please try again",
        type: "error",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: (res) => {
          toast.add({
            title: "Logged in Successfully",
            description: "Welcome to Dropzo",
            type: "success",
          });
          const role = res.data?.role;
          if (role === "ADMIN" || role === "SUPER_ADMIN") router.push("/admin");
          else if (role === "COURIER") router.push("/courier");
          else router.push("/dashboard");
        },
        onError: (err) => {
          toast.add({
            title: "Google OAuth Failed",
            description: err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      }
    );
  };

  const handleGoogleError = () => {
    toast.add({
      title: "Google OAuth Failed",
      description: "Something went wrong. Please try again",
      type: "error",
    });
  };

  return (
    <GoogleLogin
      theme="outline"
      shape="pill"
      text="continue_with"
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
    />
  );
}