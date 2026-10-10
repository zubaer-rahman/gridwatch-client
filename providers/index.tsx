"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import GoogleAuthProvider from "./GoogleAuthProvider";
import QueryProvider from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <GoogleAuthProvider>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}

export default Providers;
export * from "./GoogleAuthProvider";
export * from "./QueryProvider";
export * from "./ThemeProvider";
