import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | PH Courier & Logistics",
  description: "Explore the comprehensive range of delivery and logistics services offered by PH Courier.",
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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive logistics solutions designed to meet the unique needs of individuals and modern businesses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="flex flex-col p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
            <p className="text-muted-foreground leading-relaxed grow">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}