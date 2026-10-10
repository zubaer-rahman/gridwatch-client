"use client";

import { Bell, CheckCheck, Inbox, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "@/hooks/notification.hook";
import { extractDataArray } from "@/lib/utils";
import type { NotificationItem } from "@/types";
import { formatRelativeTime } from "@/utils/outage.utils";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifResponse, isLoading } = useNotifications();
  const notifications = extractDataArray<NotificationItem>(notifResponse?.data);

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ring"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black ring-2 ring-card animate-in zoom-in-75 duration-200">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}
      />

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 ? (
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0.2"
              >
                {unreadCount} unread
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] font-mono text-muted-foreground"
              >
                All read
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={
                markAllAsReadMutation.isPending || markAsReadMutation.isPending
              }
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                No notifications
              </p>
              <p className="text-[11px] text-muted-foreground">
                You&apos;re completely up to date with grid activities.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item)}
                className={`p-3.5 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                  item.isRead
                    ? "hover:bg-muted/30 opacity-75"
                    : "bg-primary/5 hover:bg-primary/10"
                }`}
              >
                <div
                  className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                    item.isRead
                      ? "bg-muted text-muted-foreground"
                      : "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs truncate ${
                        item.isRead
                          ? "font-medium text-foreground"
                          : "font-semibold text-foreground"
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono block pt-0.5">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
