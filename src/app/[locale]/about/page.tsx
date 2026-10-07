import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { ShieldCheck, MapPin, Clock3 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "আমাদের সম্পর্কে | Dropzo" : "About Us | Dropzo",
    description:
      locale === "bn"
        ? "ড্রপজোর লক্ষ্য, স্বপ্ন ও পণ্য পরিবহনব্যবস্থা সম্পর্কে জানুন।"
        : "Learn about Dropzo, our mission, vision and delivery platform.",
  };
}

export default function AboutPage() {
  const ui = useUiText();
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/3 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {ui("About Courier")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {ui(
              "Delivering trust and reliability across every mile. We are dedicated to providing seamless logistics solutions for businesses and individuals alike.",
            )}{" "}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
          <div className="rounded-3xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
            <h2 className="text-3xl font-bold mb-4">{ui("Our Mission")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {ui(
                "At Dropzo, our mission is to simplify the delivery process through innovative technology and a dedicated network of professionals. We aim to ensure that every parcel, no matter how small or large, reaches its destination safely, securely, and on time.",
              )}{" "}
            </p>
            <h2 className="text-3xl font-bold mb-4">{ui("Our Vision")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {ui(
                "We envision a future where logistics barriers are completely eliminated, making commerce more accessible for everyone. By expanding our hub networks and integrating real-time AI-driven tracking, we strive to become the most trusted logistics partner in the region.",
              )}{" "}
            </p>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
            <h3 className="text-xl font-bold mb-6">{ui("Why Choose Us?")}</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <div>
                  <strong className="block">{ui("Fast & Secure")}</strong>
                  <span className="text-sm text-muted-foreground">
                    {ui(
                      "Industry-leading delivery speeds with guaranteed item security.",
                    )}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <strong className="block">{ui("Real-time Tracking")}</strong>
                  <span className="text-sm text-muted-foreground">
                    {ui("Monitor your shipments at every step of the journey.")}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <Clock3 className="size-5 text-primary" />
                </div>
                <div>
                  <strong className="block">{ui("24/7 Support")}</strong>
                  <span className="text-sm text-muted-foreground">
                    {ui(
                      "Dedicated customer service team ready to assist you anytime.",
                    )}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
