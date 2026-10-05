import Link from "next/link";
import Logo from "@/assets/svg/Logo";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background text-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            <Link className="flex items-center gap-2 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" href="/">
              <Logo className="size-6"/>
              <span className="font-bold tracking-tight text-xl">Dropzo</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fast, secure, and reliable parcel delivery services across the nation. We bridge the gap between businesses and their customers.
            </p>
            <div className="flex gap-4 mt-2">
              <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">
                <FacebookIcon className="size-5"/>
              </Link>
              <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">
                <TwitterIcon className="size-5"/>
              </Link>
              <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">
                <InstagramIcon className="size-5"/>
              </Link>
              <Link className="text-muted-foreground hover:text-primary transition-colors" href="#">
                <LinkedinIcon className="size-5"/>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="/">Home</Link>
              <Link className="hover:text-primary transition-colors" href="/about">About Us</Link>
              <Link className="hover:text-primary transition-colors" href="/services">Services</Link>
              <Link className="hover:text-primary transition-colors" href="/contact">Contact</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Our Services</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="#">Standard Delivery</Link>
              <Link className="hover:text-primary transition-colors" href="#">Express Courier</Link>
              <Link className="hover:text-primary transition-colors" href="#">E-commerce Logistics</Link>
              <Link className="hover:text-primary transition-colors" href="#">Heavy Freight</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Legal & Support</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link>
              <Link className="hover:text-primary transition-colors" href="#">Cookie Policy</Link>
              <Link className="hover:text-primary transition-colors" href="#">FAQ</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="w-full py-6 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} Dropzo. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground text-center md:text-right">
            Designed for secure and fast logistics.
          </p>
        </div>
      </div>
    </footer>
  );
}