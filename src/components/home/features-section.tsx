import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

const features = [
  {
    icon: <Truck className="size-10 text-primary" />,
    title: "Fast Delivery",
    description: "We ensure your packages reach their destination in the shortest time possible."
  },
  {
    icon: <ShieldCheck className="size-10 text-primary" />,
    title: "Secure Handling",
    description: "Your packages are handled with the utmost care and security at every step."
  },
  {
    icon: <MapPin className="size-10 text-primary" />,
    title: "Live Tracking",
    description: "Track your shipments in real-time from our hubs directly to your doorstep."
  },
  {
    icon: <Clock className="size-10 text-primary" />,
    title: "24/7 Support",
    description: "Our dedicated support team is available around the clock to assist you."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Dropzo?</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            We provide top-notch logistics solutions designed for businesses and individuals alike.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-8 bg-background rounded-2xl shadow-sm border border-border/50">
              <div className="mb-6 bg-primary/10 p-4 rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}