import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}
