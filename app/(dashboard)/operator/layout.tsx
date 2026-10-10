import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["OPERATOR", "ADMIN"]}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
