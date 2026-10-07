export default function StatsSection() {
  const stats = [
    { value: "50+", label: "Cities Covered" },
    { value: "10K+", label: "Happy Customers" },
    { value: "99.9%", label: "Delivery Success" },
    { value: "24/7", label: "Customer Support" },
  ];

  return (
    <section className="relative overflow-hidden py-20 bg-linear-to-br from-primary via-primary to-blue-700 text-primary-foreground">
      <div className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
            >
              <h4 className="text-4xl md:text-5xl font-bold tracking-tight">{stat.value}</h4>
              <p className="text-primary-foreground/80 font-medium text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}