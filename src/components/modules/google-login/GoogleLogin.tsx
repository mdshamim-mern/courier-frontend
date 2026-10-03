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
        onSuccess: (res: any) => {
          toast.add({
            title: "Logged in Successfully",
            description: "Welcome to Dropzo",
            type: "success",
          });
          
          const role = res?.data?.role || res?.role;
          
          setTimeout(() => {
            if (role === "ADMIN" || role === "SUPER_ADMIN") {
              window.location.href = "/admin";
            } else if (role === "COURIER") {
              window.location.href = "/courier";
            } else {
              window.location.href = "/dashboard";
            }
          }, 500);
        },
        onError: (err: any) => {
          toast.add({
            title: "Google OAuth Failed",
            description: err?.message || "Something went wrong. Please try again",
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