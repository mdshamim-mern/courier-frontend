import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import FeaturesSection from "@/components/home/features-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import StatsSection from "@/components/home/stats-section";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24 pb-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mb-10 text-lg">
          {t("description")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            {t("login")}
          </Link>
          <Link href="/register" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            {t("register")}
          </Link>
        </div>
      </main>
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
    </div>
  );
}