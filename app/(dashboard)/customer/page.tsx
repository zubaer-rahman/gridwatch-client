import type { Metadata } from "next";
import { Suspense } from "react";
import CustomerPortalView from "@/components/modules/customer/CustomerPortalView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Customer Portal | GridWatch",
  description: "Consumer power outage reporting and real-time status updates",
};

export default function CustomerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <CustomerPortalView />
    </Suspense>
  );
}
