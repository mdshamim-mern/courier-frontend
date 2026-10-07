import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Dropzo",
  description: "Explore the comprehensive range of delivery and logistics services offered by Dropzo.",
};

export default function ServicesPage() {
  const services = [
    {
      title: "Standard Delivery",
      description: "Reliable and cost-effective delivery for your everyday parcels. Expected delivery within 2-3 business days across major cities.",
      icon: "📦",
    },
    {
      title: "Express Delivery",
      description: "Urgent shipments require priority handling. Our express service guarantees next-day delivery for time-sensitive documents and goods.",
      icon: "⚡",
    },
    {
      title: "Corporate Logistics",
      description: "Tailored B2B logistics solutions for businesses of all sizes. Manage bulk shipments easily with our dedicated corporate dashboard.",
      icon: "🏢",
    },
    {
      title: "Fragile Handling",
      description: "Specialized care and secure packaging for delicate items. We ensure your fragile goods arrive in pristine condition.",
      icon: "🛡️",
    },
    {
      title: "Cash on Delivery (COD)",
      description: "Empower your e-commerce business with our seamless COD service. Fast remittance and transparent payment tracking.",
      icon: "💵",
    },
    {
      title: "E-commerce Fulfillment",
      description: "From warehouse storage to last-mile delivery, we handle the entire supply chain so you can focus on growing your business.",
      icon: "🛒",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive logistics solutions designed to meet the unique needs of individuals and modern businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group flex flex-col p-8 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/4"
            >
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 text-3xl ring-1 ring-primary/10 transition-transform group-hover:scale-110">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed grow">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
