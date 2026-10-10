import type { Metadata } from "next";
import { Suspense } from "react";
import OverviewView from "@/components/modules/operator/OverviewView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Operations Center | GridWatch Operator",
  description: "Real-time dispatch and outage incident response",
};

export default function OperatorPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <OverviewView />
    </Suspense>
  );
}
