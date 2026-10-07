import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Mail, Clock3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Dropzo",
  description: "Get in touch with Dropzo for support, inquiries, or business partnerships.",
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question or need assistance? We are here to help you every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Head Office</h3>
                  <p className="text-muted-foreground">
                    Level 4, PH Tower<br />
                    Banani, Dhaka-1213<br />
                    Bangladesh
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <Mail className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Contact Details</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Email: support@Dropzo.com</p>
                    <p>Phone: +880 1865 190471</p>
                    <p>Hotline: 16999</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <Clock3 className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Saturday - Thursday: 9:00 AM - 8:00 PM<br />
                    Friday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/70 p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/4">
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
              <Button className="w-full shadow-lg shadow-primary/20">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}