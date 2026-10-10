"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { useCurrentUser } from "@/hooks/auth.hook";

export function DashboardRedirect() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/admin");
    } else if (user.role === "OPERATOR") {
      router.replace("/operator");
    } else {
      router.replace("/customer");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <AuthLoading label="Redirecting to operational sector..." />;
}

export default DashboardRedirect;
