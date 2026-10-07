import { useUiText } from "@/i18n/use-ui-text";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

const features = [
  {
    icon: <Truck className="size-8 text-primary" />,
    title: "Fast Delivery",
    description:
      "We ensure your packages reach their destination in the shortest time possible.",
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: "Secure Handling",
    description:
      "Your packages are handled with the utmost care and security at every step.",
  },
  {
    icon: <MapPin className="size-8 text-primary" />,
    title: "Live Tracking",
    description:
      "Track your shipments in real-time from our hubs directly to your doorstep.",
  },
  {
    icon: <Clock className="size-8 text-primary" />,
    title: "24/7 Support",
    description:
      "Our dedicated support team is available around the clock to assist you.",
  },
];

export default function FeaturesSection() {
  const ui = useUiText();
  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute top-0 left-1/4 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {ui("Why Choose Dropzo?")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {ui(
              "We provide top-notch logistics solutions designed for businesses and individuals alike.",
            )}{" "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/4"
            >
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {ui(feature.title)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {ui(feature.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
