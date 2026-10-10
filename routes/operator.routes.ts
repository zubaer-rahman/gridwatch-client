import {
  AlertTriangle,
  CheckSquare,
  LayoutDashboard,
  Network,
} from "lucide-react";
import type { NavGroup } from "@/types/sidebar.type";

export const operatorRoutes: NavGroup[] = [
  {
    title: "Field Dispatch & Grid",
    items: [
      {
        title: "Operations Center",
        url: "/operator",
        icon: LayoutDashboard,
      },
      {
        title: "Outage Management",
        url: "/operator/outages",
        icon: AlertTriangle,
      },
      {
        title: "My Dispatches",
        url: "/operator/my-work",
        icon: CheckSquare,
      },
      {
        title: "Grid Topology",
        url: "/operator/grid-network",
        icon: Network,
      },
    ],
  },
];
