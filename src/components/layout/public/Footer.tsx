import Link from "next/link";
import Logo from "@/assets/svg/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
            <Logo className="size-6" />
            <span className="font-bold tracking-tight">Dropzo</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
            Fast, secure, and reliable parcel delivery services across the nation.
          </p>
        </div>
        <div className="flex gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
        </div>
      </div>
      <div className="w-full py-4 border-t bg-muted/20 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Dropzo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}