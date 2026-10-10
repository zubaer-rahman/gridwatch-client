import type { Metadata } from "next";
import { Suspense } from "react";
import AdminPortalView from "@/components/modules/admin/AdminPortalView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "System Overview | GridWatch Admin",
  description:
    "Administrative telemetry, sector statistics, and governance portal",
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <AdminPortalView />
    </Suspense>
  );
}
