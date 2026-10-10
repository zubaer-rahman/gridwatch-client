import { Skeleton } from "@/components/ui/skeleton";

export function OutagesSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skel-row-${i}`}
            className="flex items-center gap-4 border-b border-border p-4 last:border-b-0"
          >
            <Skeleton className="h-4 w-24 font-mono" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28 font-mono" />
            <Skeleton className="h-8 w-16 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default OutagesSkeleton;
