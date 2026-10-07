"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";

export default function GoogleAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const locale = useLocale();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId} locale={locale}>
      {children}
    </GoogleOAuthProvider>
  );
}
