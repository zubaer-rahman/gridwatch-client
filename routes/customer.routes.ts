import { Home } from "lucide-react";
import type { NavGroup } from "@/types/sidebar.type";

export const customerRoutes: NavGroup[] = [
  {
    title: "Consumer Services",
    items: [
      {
        title: "Consumer Portal",
        url: "/customer",
        icon: Home,
      },
    ],
  },
];
