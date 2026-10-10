"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Home,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayment } from "@/hooks/payment.hook";
import { formatBDT } from "@/utils/outage.utils";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const paymentID =
    searchParams.get("paymentID") || searchParams.get("transactionId");
  const statusParam = searchParams.get("status")?.toLowerCase();
  const paymentId = searchParams.get("paymentId");

  const { data: paymentResponse, refetch } = usePayment(paymentId || "");
  const payment = paymentResponse?.data;

  const isSuccess = statusParam === "success" || payment?.status === "SUCCESS";
  const isFailed =
    statusParam === "failure" ||
    statusParam === "cancel" ||
    payment?.status === "FAILED";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl text-center space-y-6">
        {isSuccess ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5 animate-in zoom-in-90 duration-300">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Payment Verified Successfully!
              </h1>
              <p className="text-sm text-muted-foreground">
                Your bKash priority SLA transaction was processed and confirmed.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2.5 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Settlement Channel:
                </span>
                <span className="font-semibold text-[#D12053] font-mono">
                  bKash Priority Gateway
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount Settled:</span>
                <span className="font-bold font-mono text-foreground text-sm">
                  {formatBDT(payment?.amount || 200)}
                </span>
              </div>
              {paymentID && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-muted-foreground truncate max-w-[200px]">
                    {paymentID}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-muted-foreground">Priority SLA:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-500" />
                  Active / Fast-Track Dispatched
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/customer/reports" className="w-full sm:w-auto">
                <Button className="w-full gap-2">
                  <span>View Outage Reports</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/customer" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  <span>Consumer Portal</span>
                </Button>
              </Link>
            </div>
          </>
        ) : isFailed ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center ring-8 ring-rose-500/5 animate-in zoom-in-90 duration-300">
              <XCircle className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Payment Not Completed
              </h1>
              <p className="text-sm text-muted-foreground">
                The transaction was cancelled or declined by the bKash payment
                gateway.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-xs text-muted-foreground text-left space-y-1">
              <p className="font-medium text-foreground">
                Don&apos;t worry — your outage report is still recorded under
                Standard SLA.
              </p>
              <p>
                You can retry priority escalation anytime from your reports
                history.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/customer/reports" className="w-full sm:w-auto">
                <Button className="w-full gap-2">
                  <span>Return to Outage Reports</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/customer" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  <span>Consumer Portal</span>
                </Button>
              </Link>
            </div>
          </>
        ) : (
          /* Pending / Polling */
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center ring-8 ring-amber-500/5">
              <Clock className="h-9 w-9 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Verifying Transaction...
              </h1>
              <p className="text-sm text-muted-foreground">
                Checking payment verification state with the settlement gateway.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh Status</span>
              </Button>
              <Link href="/customer/reports">
                <Button size="sm">Go to Reports</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 space-y-4 text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
