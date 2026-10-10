"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

export interface AccessDeniedProps {
  allowedRoles?: Role[];
  userRole?: Role;
}

export function AccessDenied({ allowedRoles, userRole }: AccessDeniedProps) {
  let targetDashboard = "/login";
  if (userRole === "ADMIN") targetDashboard = "/admin";
  else if (userRole === "OPERATOR") targetDashboard = "/operator";
  else if (userRole === "CUSTOMER") targetDashboard = "/customer";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5 rounded-2xl border border-destructive/20 bg-card p-8 shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground">
            Your current account credentials ({userRole || "UNKNOWN"}) do not
            have permission to view this sector.
          </p>
          {allowedRoles && allowedRoles.length > 0 && (
            <p className="text-xs font-mono text-muted-foreground/80">
              Required Clearance: {allowedRoles.join(" | ")}
            </p>
          )}
        </div>
        <div className="pt-2">
          <Link
            href={targetDashboard}
            className={cn(
              buttonVariants(),
              "bg-primary text-primary-foreground",
            )}
          >
            Return to Authorized Sector
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
