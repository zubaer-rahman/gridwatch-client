"use client";

import { LogOut, Menu, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/hooks/auth.hook";

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Create friendly breadcrumb label from route
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumb =
    pathSegments
      .map(
        (seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
      )
      .join(" / ") || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Route Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
          <span className="text-muted-foreground">Operations</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true }),
            );
          }}
          className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-amber-500/50 hover:bg-muted"
        >
          <Search className="h-3.5 w-3.5 text-amber-500" />
          <span>Quick search...</span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Live Notification Center */}
        <NotificationCenter />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar
              fallback={user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              size="sm"
              className="cursor-pointer border-amber-500/30 ring-1 ring-amber-500/20"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">
                  {user?.email?.split("@")[0] || "Operator"}
                </span>
                {user?.role && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono"
                  >
                    {user.role}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "user@gridwatch.bd"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>ID: {user?.userId?.slice(0, 8)}...</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;
