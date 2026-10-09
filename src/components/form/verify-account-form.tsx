"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { authDestination } from "@/lib/auth-destination";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useVerifyEmail } from "@/hooks";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";

export default function VerifyAccountForm() {
  const ui = useUiText();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const { mutate: verify, isPending } = useVerifyEmail();

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleVerify = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    verify(
      { email, otp },
      {
        onSuccess: () => {
          toast.add({
            title: "Verification Successful",
            description: "Your account is now verified.",
            type: "success",
          });
          router.push(authDestination("CUSTOMER", searchParams.get("next")));
        },
        onError: (err) => {
          setIsInvalid(true);
          toast.add({
            title: "Verification Failed",
            description: err.message || "Invalid OTP code.",
            type: "error",
          });
        },
      },
    );
  };

  if (!email) return null;

  return (
    <Card className="w-full shadow-lg border-muted/20">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">{ui("Verify your email")}</CardTitle>
        <CardDescription>
          {ui("We sent a 6-digit code to")}{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <form
          method="post"
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
        >
          <Field
            data-invalid={isInvalid}
            className="flex flex-col items-center gap-4"
          >
            <FieldLabel htmlFor="otp" className="sr-only">
              {ui("OTP Code")}
            </FieldLabel>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (isInvalid) setIsInvalid(false);
              }}
              pattern={REGEXP_ONLY_DIGITS}
              id="otp"
              disabled={isPending}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={1}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={2}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={3}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={4}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={5}
                  className="rounded-md border h-12 w-10 text-lg"
                />
              </InputOTPGroup>
            </InputOTP>
            {isInvalid && (
              <FieldError errors={[{ message: "Invalid or expired code" }]} />
            )}
            <FieldDescription className="text-center mt-2">
              {ui("Please enter the code to complete registration")}{" "}
            </FieldDescription>
          </Field>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          form="otp-form"
          type="submit"
          className="w-full"
          disabled={isPending || otp.length !== 6}
        >
          {isPending ? <Spinner className="mr-2" /> : null}
          {isPending ? ui("Verifying...") : ui("Verify Account")}
        </Button>
      </CardFooter>
    </Card>
  );
}
