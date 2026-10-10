import type { Metadata } from "next";
import { Suspense } from "react";
import AuditLogView from "@/components/modules/admin/AuditLogView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Audit Trail & Compliance | GridWatch Admin",
  description:
    "Tamper-evident record of administrative changes, security modifications, and grid operations",
};

export default function AdminAuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <AuditLogView />
    </Suspense>
  );
}
