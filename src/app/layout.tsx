import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";
import { Toaster } from "@/components/ui/toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "@/components/layout/public/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Dropzo",
  description: "Fast and reliable courier service platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy-id-for-build"}>
          <Providers>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}