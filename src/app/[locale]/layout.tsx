import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";
import { Toaster } from "@/components/ui/toast";
import Header from "@/components/layout/public/Header";
import Footer from "@/components/layout/public/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "Dropzo" : "Dropzo",
    description:
      locale === "bn"
        ? "দ্রুত ও নির্ভরযোগ্য পার্সেল পরিবহনের ব্যবস্থা।"
        : "Fast and reliable courier service platform.",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body className="min-h-svh flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main id="main-content" className="site-content">{children}</main>
            <Footer />
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
