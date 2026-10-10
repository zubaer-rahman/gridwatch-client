import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["CUSTOMER", "ADMIN"]}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
