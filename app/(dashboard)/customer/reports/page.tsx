import type { Metadata } from "next";
import { Suspense } from "react";
import CustomerPortalView from "@/components/modules/customer/CustomerPortalView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Outage Reports | GridWatch",
  description: "Consumer power outage reports and real-time status tracking",
};

export default function CustomerReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <CustomerPortalView />
    </Suspense>
  );
}
