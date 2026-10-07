import { PackagePlus, Truck, Map, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <PackagePlus className="size-7 text-primary" />,
    title: "Create Shipment",
    description: "Enter package details and destination."
  },
  {
    icon: <Map className="size-7 text-primary" />,
    title: "Hub Assignment",
    description: "Package is routed through our network."
  },
  {
    icon: <Truck className="size-7 text-primary" />,
    title: "In Transit",
    description: "Assigned to a courier for delivery."
  },
  {
    icon: <CheckCircle2 className="size-7 text-primary" />,
    title: "Delivered",
    description: "Successfully handed over to receiver."
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A simple, streamlined process to get your package from A to B.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
          <div className="hidden md:block absolute top-10 left-[10%] w-[80%] h-px bg-linear-to-r from-transparent via-border to-transparent -z-10" />
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center size-20 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-6 dark:border-white/10 dark:bg-white/4">
                {step.icon}
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-linear-to-br from-primary to-blue-600 text-xs font-bold text-white shadow-md">
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