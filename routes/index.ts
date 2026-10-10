import type { Role } from "@/types";
import type { NavGroup } from "@/types/sidebar.type";
import { adminRoutes } from "./admin.routes";
import { customerRoutes } from "./customer.routes";
import { operatorRoutes } from "./operator.routes";

export * from "./admin.routes";
export * from "./customer.routes";
export * from "./operator.routes";

export function getRoutesForRole(role?: Role): NavGroup[] {
  if (role === "ADMIN") {
    return adminRoutes;
  }
  if (role === "OPERATOR") {
    return operatorRoutes;
  }
  return customerRoutes;
}
