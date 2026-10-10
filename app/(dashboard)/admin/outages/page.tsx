import type { Metadata } from "next";
import { OutagesView } from "@/components/modules/outages/OutagesView";

export const metadata: Metadata = {
  title: "Outage Incidents | GridWatch Admin",
  description:
    "Administrative oversight of grid outage incidents and restoration performance.",
};

export default function AdminOutagesPage() {
  return <OutagesView />;
}
