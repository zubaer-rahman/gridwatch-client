"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

function getToastTypeStyles(type?: string) {
  switch (type) {
    case "success":
      return {
        root: "border-emerald-600/30 bg-emerald-50/95 text-emerald-950 dark:border-emerald-500/40 dark:bg-card/95 dark:text-foreground shadow-lg shadow-emerald-950/10 dark:shadow-emerald-950/40 ring-1 ring-emerald-500/10",
        badge:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30",
        title:
          "text-emerald-950 dark:text-emerald-100 font-semibold tracking-tight",
        description: "text-emerald-800/90 dark:text-emerald-300/80 text-xs",
        close:
          "text-emerald-700/70 hover:text-emerald-950 hover:bg-emerald-200/50 dark:text-emerald-400/70 dark:hover:text-emerald-200 dark:hover:bg-emerald-950/50",
      };
    case "error":
      return {
        root: "border-rose-600/30 bg-rose-50/95 text-rose-950 dark:border-destructive/40 dark:bg-card/95 dark:text-foreground shadow-lg shadow-rose-950/10 dark:shadow-destructive/20 ring-1 ring-destructive/10",
        badge:
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-rose-500/30",
        title: "text-rose-950 dark:text-rose-100 font-semibold tracking-tight",
        description: "text-rose-800/90 dark:text-rose-300/80 text-xs",
        close:
          "text-rose-700/70 hover:text-rose-950 hover:bg-rose-200/50 dark:text-rose-400/70 dark:hover:text-rose-200 dark:hover:bg-rose-950/50",
      };
    case "warning":
      return {
        root: "border-amber-600/30 bg-amber-50/95 text-amber-950 dark:border-amber-500/40 dark:bg-card/95 dark:text-foreground shadow-lg shadow-amber-950/10 dark:shadow-amber-950/40 ring-1 ring-amber-500/10",
        badge:
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30",
        title:
          "text-amber-950 dark:text-amber-100 font-semibold tracking-tight",
        description: "text-amber-800/90 dark:text-amber-300/80 text-xs",
        close:
          "text-amber-700/70 hover:text-amber-950 hover:bg-amber-200/50 dark:text-amber-400/70 dark:hover:text-amber-200 dark:hover:bg-amber-950/50",
      };
    case "info":
      return {
        root: "border-sky-600/30 bg-sky-50/95 text-sky-950 dark:border-sky-500/40 dark:bg-card/95 dark:text-foreground shadow-lg shadow-sky-950/10 dark:shadow-sky-950/40 ring-1 ring-sky-500/10",
        badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-sky-500/30",
        title: "text-sky-950 dark:text-sky-100 font-semibold tracking-tight",
        description: "text-sky-800/90 dark:text-sky-300/80 text-xs",
        close:
          "text-sky-700/70 hover:text-sky-950 hover:bg-sky-200/50 dark:text-sky-400/70 dark:hover:text-sky-200 dark:hover:bg-sky-950/50",
      };
    case "loading":
      return {
        root: "border-amber-500/30 bg-card/95 text-foreground shadow-lg ring-1 ring-amber-500/10",
        badge: "bg-amber-500/15 text-amber-500 ring-amber-500/30",
        title: "text-foreground font-semibold tracking-tight",
        description: "text-muted-foreground text-xs",
        close: "text-muted-foreground hover:text-foreground hover:bg-muted",
      };
    default:
      return {
        root: "border-border bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-md ring-1 ring-border/50",
        badge: "bg-primary/10 text-primary ring-primary/20",
        title: "text-foreground font-semibold tracking-tight",
        description: "text-muted-foreground text-xs",
        close: "text-muted-foreground hover:text-foreground hover:bg-muted",
      };
  }
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border backdrop-blur-md transition-all will-change-transform outline-none select-none hover:scale-[1.01] hover:shadow-xl focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-3.5 sm:p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="xs" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = (
    <Button variant="ghost" size="icon-xs" className="h-7 w-7 rounded-lg" />
  ),
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground/80 after:absolute after:-inset-2 after:content-[''] hover:text-foreground transition-colors cursor-pointer",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon className="size-3.5" aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({
  type,
  className,
}: {
  type: string | undefined;
  className?: string;
}) {
  let icon: React.ReactNode = null;

  if (type === "success") {
    icon = <CircleCheckIcon className="size-4" aria-hidden="true" />;
  } else if (type === "info") {
    icon = <InfoIcon className="size-4" aria-hidden="true" />;
  } else if (type === "warning") {
    icon = <TriangleAlertIcon className="size-4" aria-hidden="true" />;
  } else if (type === "error") {
    icon = <OctagonXIcon className="size-4" aria-hidden="true" />;
  } else if (type === "loading") {
    icon = <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />;
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-1.5 ring-1 ring-inset shadow-xs",
        className,
      )}
    >
      {icon}
    </span>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => {
    const styles = getToastTypeStyles(toastItem.type);

    return (
      <Toast key={toastItem.id} toast={toastItem} className={styles.root}>
        <ToastContent>
          <ToastIcon type={toastItem.type} className={styles.badge} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle className={styles.title} />
            <ToastDescription className={styles.description} />
          </div>
          <ToastAction />
          <ToastClose className={styles.close} />
        </ToastContent>
      </Toast>
    );
  });
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
