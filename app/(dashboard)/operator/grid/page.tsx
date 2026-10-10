import type { Metadata } from "next";
import { Suspense } from "react";
import GridNetworkView from "@/components/modules/grid/GridNetworkView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Grid Infrastructure | GridWatch Operator",
  description: "National power distribution hierarchy and network topology",
};

export default function OperatorGridPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-[480px] rounded-xl" />
            <Skeleton className="h-[480px] rounded-xl" />
            <Skeleton className="h-[480px] rounded-xl" />
            <Skeleton className="h-[480px] rounded-xl" />
          </div>
        </div>
      }
    >
      <GridNetworkView />
    </Suspense>
  );
}
