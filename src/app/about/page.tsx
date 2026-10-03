import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Courier & Logistics",
  description: "Learn about Courier & Logistics, our mission, vision, and how we are transforming the delivery ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">About Courier</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Delivering trust and reliability across every mile. We are dedicated to providing seamless logistics solutions for businesses and individuals alike.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            At Dropzo, our mission is to simplify the delivery process through innovative technology and a dedicated network of professionals. We aim to ensure that every parcel, no matter how small or large, reaches its destination safely, securely, and on time.
          </p>
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            We envision a future where logistics barriers are completely eliminated, making commerce more accessible for everyone. By expanding our hub networks and integrating real-time AI-driven tracking, we strive to become the most trusted logistics partner in the region.
          </p>
        </div>
        <div className="bg-muted/50 rounded-2xl p-8 border">
          <h3 className="text-xl font-bold mb-4">Why Choose Us?</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="bg-primary/10 p-1 rounded-full text-primary mt-1">✓</span>
              <div>
                <strong className="block">Fast & Secure</strong>
                <span className="text-sm text-muted-foreground">Industry-leading delivery speeds with guaranteed item security.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary/10 p-1 rounded-full text-primary mt-1">✓</span>
              <div>
                <strong className="block">Real-time Tracking</strong>
                <span className="text-sm text-muted-foreground">Monitor your shipments at every step of the journey.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary/10 p-1 rounded-full text-primary mt-1">✓</span>
              <div>
                <strong className="block">24/7 Support</strong>
                <span className="text-sm text-muted-foreground">Dedicated customer service team ready to assist you anytime.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}