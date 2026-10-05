import { PackagePlus, Truck, Map, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <PackagePlus className="size-8 text-primary" />,
    title: "Create Shipment",
    description: "Enter package details and destination."
  },

  {
    icon: <Map className="size-8 text-primary" />,
    title: "Hub Assignment",
    description: "Package is routed through our network."
  },
  {
    icon: <Truck className="size-8 text-primary" />,
    title: "In Transit",
    description: "Assigned to a courier for delivery."
  },
  {
    icon: <CheckCircle2 className="size-8 text-primary" />,
    title: "Delivered",
    description: "Successfully handed over to receiver."
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A simple, streamlined process to get your package from A to B.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-[10%] w-[80%] h-0.5 bg-muted -z-10" />
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-background border-4 border-muted flex items-center justify-center size-20 rounded-full mb-6 relative">
                {step.icon}
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground size-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}