import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
