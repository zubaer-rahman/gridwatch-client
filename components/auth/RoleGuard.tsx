"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { useCurrentUser } from "@/hooks/auth.hook";
import type { Role } from "@/types";

export interface RoleGuardProps {
  children: ReactNode;
  roles: Role[];
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  const isAuthorized = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <AuthLoading label="Verifying clearance..." />;
  }

  if (!isAuthenticated) {
    return <AuthLoading label="Redirecting to sign in..." />;
  }

  if (!isAuthorized) {
    return <AccessDenied allowedRoles={roles} userRole={user?.role} />;
  }

  return <>{children}</>;
}

export default RoleGuard;
