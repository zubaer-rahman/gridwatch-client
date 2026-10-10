import { Zap } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AuthLoading({
  label = "Authenticating with GridWatch...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
        <Zap className="h-7 w-7 animate-pulse" />
      </div>
      <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
        <Spinner className="h-4 w-4 text-amber-500" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export default AuthLoading;
