"use client";

import {
  AlertTriangle,
  FileText,
  LayoutDashboard,
  MapPin,
  Moon,
  Network,
  Plus,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useAreas, useZones } from "@/hooks/grid.hook";
import { useOutages } from "@/hooks/outage.hook";
import { useTheme } from "@/providers/ThemeProvider";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { user } = useCurrentUser();

  // Fetch real outages and grid entities for search
  const { data: outagesResponse } = useOutages();
  const { data: areasResponse } = useAreas();
  const { data: zonesResponse } = useZones();

  const outages = outagesResponse?.data || [];
  const areas = areasResponse?.data || [];
  const zones = zonesResponse?.data || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const handleSelectNav = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const role = user?.role;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, outage, or grid location..." />
      <CommandList className="max-h-96">
        <CommandEmpty>No matching results found.</CommandEmpty>

        {/* Operations & Quick Actions */}
        <CommandGroup heading="Actions">
          {role === "OPERATOR" || role === "ADMIN" ? (
            <CommandItem
              onSelect={() => {
                const target =
                  role === "ADMIN"
                    ? "/admin/outages?log=true"
                    : "/operator/outages?log=true";
                handleSelectNav(target);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-amber-500" />
              <span>Log New Outage Incident</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          ) : (
            <CommandItem onSelect={() => handleSelectNav("/customer")}>
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              <span>Report Power Interruption</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          )}

          <CommandItem
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="mr-2 h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-sky-500" />
            )}
            <span>
              Toggle Theme ({resolvedTheme === "dark" ? "Light" : "Dark"} Mode)
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Primary Navigation */}
        <CommandGroup heading="Navigation">
          {role === "ADMIN" && (
            <>
              <CommandItem onSelect={() => handleSelectNav("/admin")}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>System Overview</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelectNav("/admin/outages")}>
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                <span>Outage Incidents Desk</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelectNav("/admin/grid")}>
                <Network className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Grid Infrastructure Hierarchy</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelectNav("/admin/users")}>
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>User Directory & RBAC</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectNav("/admin/audit-logs")}
              >
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Audit Trail & Chronicle</span>
              </CommandItem>
            </>
          )}

          {role === "OPERATOR" && (
            <>
              <CommandItem onSelect={() => handleSelectNav("/operator")}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Operations Center</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectNav("/operator/outages")}
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                <span>Outage Incident Desk</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectNav("/operator/my-work")}
              >
                <Zap className="mr-2 h-4 w-4 text-primary" />
                <span>My Field Work Dispatches</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelectNav("/operator/grid")}>
                <Network className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Grid Network Topology</span>
              </CommandItem>
            </>
          )}

          {role === "CUSTOMER" && (
            <>
              <CommandItem onSelect={() => handleSelectNav("/customer")}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Consumer Portal</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectNav("/customer/reports")}
              >
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>My Incident Reports</span>
              </CommandItem>
            </>
          )}
        </CommandGroup>

        {/* Real Active Outages */}
        {outages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Active Outages & Incidents">
              {outages.slice(0, 6).map((outage) => (
                <CommandItem
                  key={outage.id}
                  value={`${outage.description || ""} ${outage.area?.name || ""} ${outage.id} ${outage.status}`}
                  onSelect={() => {
                    const basePath =
                      role === "ADMIN" ? "/admin/outages" : "/operator/outages";
                    handleSelectNav(`${basePath}?outage=${outage.id}`);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        outage.priority === "HIGH"
                          ? "bg-destructive"
                          : outage.priority === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-primary"
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-medium text-foreground">
                        {outage.description ||
                          `Outage in ${outage.area?.name || "Sector"}`}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {outage.area?.name || "Sector"} • {outage.status}
                      </span>
                    </div>
                  </div>
                  <CommandShortcut className="font-mono text-[10px]">
                    {outage.priority}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Grid Locations & Sectors */}
        {(areas.length > 0 || zones.length > 0) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Grid Sectors & Zones">
              {zones.map((zone) => (
                <CommandItem
                  key={zone.id}
                  value={`Zone ${zone.name} ${zone.description || ""}`}
                  onSelect={() => {
                    const path =
                      role === "ADMIN" ? "/admin/grid" : "/operator/grid";
                    handleSelectNav(path);
                  }}
                >
                  <Network className="mr-2 h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">Zone: {zone.name}</span>
                  <CommandShortcut>Zone</CommandShortcut>
                </CommandItem>
              ))}

              {areas.slice(0, 8).map((area) => (
                <CommandItem
                  key={area.id}
                  value={`Area ${area.name} ${area.feeder?.name || ""}`}
                  onSelect={() => {
                    const path =
                      role === "CUSTOMER"
                        ? "/customer"
                        : role === "ADMIN"
                          ? "/admin/grid"
                          : "/operator/grid";
                    handleSelectNav(path);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    Area: {area.name}{" "}
                    {area.feeder?.name ? `(${area.feeder.name})` : ""}
                  </span>
                  <CommandShortcut>Area</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
