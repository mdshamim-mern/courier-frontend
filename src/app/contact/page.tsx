import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Contact Us | PH Courier & Logistics",
  description: "Get in touch with PH Courier & Logistics for support, inquiries, or business partnerships.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have a question or need assistance? We are here to help you every step of the way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Head Office</h3>
            <p className="text-muted-foreground">
              Level 4, PH Tower<br />
              Banani, Dhaka-1213<br />
              Bangladesh
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Contact Details</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: support@phcourier.com</p>
              <p>Phone: +880 1865 111111</p>
              <p>Hotline: 16999</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Business Hours</h3>
            <p className="text-muted-foreground">
              Saturday - Thursday: 9:00 AM - 8:00 PM<br />
              Friday: Closed
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-30" 
                placeholder="Write your message here..."
              ></textarea>
            </div>
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}