"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { useCurrentUser } from "@/hooks/auth.hook";

export interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <AuthLoading label="Verifying security credentials..." />;
  }

  if (!isAuthenticated) {
    return <AuthLoading label="Redirecting to sign in..." />;
  }

  return <>{children}</>;
}

export default AuthGuard;
