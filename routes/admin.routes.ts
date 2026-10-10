import {
  AlertTriangle,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Network,
  Users,
} from "lucide-react";
import type { NavGroup } from "@/types/sidebar.type";

export const adminRoutes: NavGroup[] = [
  {
    title: "Operations & Telemetry",
    items: [
      {
        title: "System Overview",
        url: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Outages",
        url: "/admin/outages",
        icon: AlertTriangle,
      },
      {
        title: "Schedules",
        url: "/admin/schedules",
        icon: CalendarClock,
      },
      {
        title: "Grid Network",
        url: "/admin/grid",
        icon: Network,
      },
    ],
  },
  {
    title: "Governance",
    items: [
      {
        title: "User Directory",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Audit Trail",
        url: "/admin/audit-logs",
        icon: FileText,
      },
    ],
  },
];
