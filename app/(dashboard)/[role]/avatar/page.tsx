import type { Metadata } from "next";
import { Suspense } from "react";
import AvatarUploadView from "@/components/modules/profile/AvatarUploadView";
import { Skeleton } from "@/components/ui/skeleton";

export function generateStaticParams() {
  return [{ role: "admin" }, { role: "operator" }, { role: "customer" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  const capitalizedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  return {
    title: `Profile Avatar | GridWatch ${capitalizedRole}`,
    description: `Update and manage ${role} profile visual identity and credentials`,
  };
}

export default function CommonRoleAvatarPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-80 md:col-span-2 rounded-2xl" />
          </div>
        </div>
      }
    >
      <AvatarUploadView />
    </Suspense>
  );
}
