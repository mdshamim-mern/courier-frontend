import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Shipment | PH Courier & Logistics",
  description: "Track the real-time status and location of your parcel using your unique tracking ID.",
};

export default function TrackShipmentPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="text-center mb-10 w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Track Your Parcel</h1>
        <p className="text-lg text-muted-foreground">
          Enter your Tracking ID below to get real-time updates on your shipment status and estimated delivery time.
        </p>
      </div>

      <div className="w-full max-w-xl bg-card border rounded-2xl p-6 md:p-8 shadow-lg">
        <form className="flex flex-col sm:flex-row gap-3">
          <Input 
            className="grow h-12 text-lg" 
            placeholder="e.g. TRK-9876543210" 
            aria-label="Tracking ID"
          />
          <Button type="button" className="h-12 px-8 text-base">
            <Search className="mr-2 size-5" />
            Track
          </Button>
        </form>
        
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p className="text-sm">
            Tracking information usually updates within 2-4 hours after the parcel is scanned at our hubs.
          </p>
        </div>
      </div>
    </div>
  );
}