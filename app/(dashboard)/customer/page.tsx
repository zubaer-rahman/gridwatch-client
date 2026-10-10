import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal | GridWatch",
  description: "Consumer power outage reporting and status updates",
};

export default function CustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Portal</h1>
        <p className="text-sm text-muted-foreground">
          Check local electricity status, file reports, and track restoration
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Customer portal initialized. Outage reporting and priority payment
          features will load in subsequent milestones.
        </p>
      </div>
    </div>
  );
}
