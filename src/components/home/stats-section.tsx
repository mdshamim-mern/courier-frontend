export default function StatsSection() {
  const stats = [
    { value: "50+", label: "Cities Covered" },
    { value: "10K+", label: "Happy Customers" },
    { value: "99.9%", label: "Delivery Success" },
    { value: "24/7", label: "Customer Support" },
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center space-y-3">
              <h4 className="text-4xl md:text-5xl font-bold tracking-tight">{stat.value}</h4>
              <p className="text-primary-foreground/80 font-medium text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}