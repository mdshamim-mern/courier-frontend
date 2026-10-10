import EmptyState from "@/assets/svg/EmptyState";

export function EmptyStatePanel({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 text-center text-muted-foreground">
      <EmptyState className="size-14 text-primary/50" />
      <p>{title}</p>
    </div>
  );
}
