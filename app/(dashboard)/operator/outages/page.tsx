import type { Metadata } from "next";
import { OutagesView } from "@/components/modules/outages/OutagesView";

export const metadata: Metadata = {
  title: "Outage Queue | GridWatch Operator",
  description:
    "Monitor and manage live electrical outage incidents across the grid.",
};

export default function OperatorOutagesPage() {
  return <OutagesView />;
}
