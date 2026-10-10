import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Overview | GridWatch Admin",
  description: "Administrative telemetry and governance portal",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <p className="text-sm text-muted-foreground">
          Administrative control center and distribution sector governance
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Admin portal initialized. Statistics and audit log modules will load
          in subsequent milestones.
        </p>
      </div>
    </div>
  );
}
