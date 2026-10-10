import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations Center | GridWatch Operator",
  description: "Real-time dispatch and outage incident response",
};

export default function OperatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations Center</h1>
        <p className="text-sm text-muted-foreground">
          Live grid telemetry, outage incident queue, and field crew dispatch
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Operator portal initialized. Real-time KPIs and incident views will
          load in subsequent milestones.
        </p>
      </div>
    </div>
  );
}
