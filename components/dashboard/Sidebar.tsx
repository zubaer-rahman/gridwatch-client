"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/auth.hook";
import { cn } from "@/lib/utils";
import { getRoutesForRole } from "@/routes";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const navGroups = getRoutesForRole(user?.role);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-black shadow-sm">
            <Zap className="h-4 w-4 fill-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm leading-tight">
              GridWatch<span className="text-amber-500">.bd</span>
            </span>
            <span className="text-[10px] font-normal text-muted-foreground">
              Distributor Operations
            </span>
          </div>
        </Link>
        {user?.role && (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-[10px] font-mono text-amber-500 uppercase"
          >
            {user.role}
          </Badge>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/admin" &&
                    item.url !== "/operator" &&
                    item.url !== "/customer" &&
                    pathname.startsWith(item.url));

                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-500">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="border-t border-border p-4">
        <div className="rounded-xl border border-border bg-card p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[11px]">GRID FREQUENCY</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-mono text-sm font-semibold text-foreground">
            50.02 Hz{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              NORMAL
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
