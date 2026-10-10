import type { Metadata } from "next";
import { Suspense } from "react";
import UsersView from "@/components/modules/admin/UsersView";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "User Directory & RBAC | GridWatch Admin",
  description: "Role-based access control and system user management",
};

export default function AdminUsersPage() {
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
      <UsersView />
    </Suspense>
  );
}
