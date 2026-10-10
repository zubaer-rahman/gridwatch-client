import type { Metadata } from "next";
import { Suspense } from "react";
import { ScheduleManagementView } from "@/components/modules/schedule";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Schedules & Maintenance | GridWatch Admin",
  description:
    "Plan and control national grid load shedding and maintenance windows",
};

export default function AdminSchedulesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <ScheduleManagementView />
    </Suspense>
  );
}
