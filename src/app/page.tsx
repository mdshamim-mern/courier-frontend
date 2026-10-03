import Header from "@/components/layout/public/Header";
import Footer from "@/components/layout/public/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Dropzo</h1>
        <p className="text-muted-foreground max-w-lg mb-8">
          The fastest and most reliable way to deliver your packages across the country. 
          Manage your shipments, track deliveries, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Button render={<Link href="/login" />} nativeButton={false} size="lg">
            Login Now
          </Button>
          <Button render={<Link href="/register" />} nativeButton={false} variant="outline" size="lg">
            Create Account
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}