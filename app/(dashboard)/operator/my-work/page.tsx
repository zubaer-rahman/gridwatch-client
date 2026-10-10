import type { Metadata } from "next";
import { Suspense } from "react";
import MyWorkView from "@/components/modules/operator/MyWorkView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Work Queue | GridWatch Operator",
  description: "Personal assigned outage incidents and repair dispatches",
};

export default function MyWorkPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <MyWorkView />
    </Suspense>
  );
}
