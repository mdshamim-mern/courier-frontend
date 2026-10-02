"use client";

import { format } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TrackingEvent {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
}

interface TrackingTimelineProps {
  trackings: TrackingEvent[];
}

export default function TrackingTimeline({ trackings }: TrackingTimelineProps) {
  if (!trackings || trackings.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No tracking information available yet.</div>;
  }

  const sortedTrackings = [...trackings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="relative pl-6 border-l-2 border-muted space-y-8 my-4">
      {sortedTrackings.map((event, index) => {
        const isLatest = index === 0;
        return (
          <div key={event.id} className="relative">
            <span className="absolute -left-[35px] bg-background">
              {isLatest ? (
                <CheckCircle2 className="size-6 text-primary bg-background rounded-full" />
              ) : (
                <Circle className="size-6 text-muted-foreground bg-background rounded-full" />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <h4 className={`font-semibold text-sm ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                {event.status.replace(/_/g, ' ')}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{format(new Date(event.createdAt), "MMM dd, yyyy - hh:mm a")}</span>
              </div>
              {event.note && (
                <p className="text-sm mt-1 text-muted-foreground border-l-2 pl-3 ml-1 border-muted">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}