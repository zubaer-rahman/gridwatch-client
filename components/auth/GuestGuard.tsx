"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { useCurrentUser } from "@/hooks/auth.hook";

export interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "OPERATOR") {
        router.replace("/operator");
      } else {
        router.replace("/customer");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <AuthLoading label="Verifying session credentials..." />;
  }

  if (isAuthenticated) {
    return <AuthLoading label="Redirecting to your dashboard..." />;
  }

  return <>{children}</>;
}

export default GuestGuard;
