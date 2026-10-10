"use client";

import { CreditCard, ExternalLink, Flame, Shield, X, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useInitiatePayment } from "@/hooks/payment.hook";
import type { OutageReport } from "@/types";
import { formatBDT } from "@/utils/outage.utils";

interface BkashPaymentModalProps {
  report: OutageReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BkashPaymentModal({
  report,
  isOpen,
  onClose,
}: BkashPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const initiateMutation = useInitiatePayment();

  if (!isOpen || !report) return null;

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await initiateMutation.mutateAsync({
        amount: 200,
        outageReportId: report.id,
        reason: "Priority Outage SLA Verification Fee",
      });

      const paymentData = response?.data;

      if (paymentData?.bkashURL) {
        toast.add({
          title: "Redirecting to bKash",
          description: "Forwarding to secure bKash payment gateway...",
          type: "success",
        });
        window.location.href = paymentData.bkashURL;
      } else {
        toast.add({
          title: "Payment Initiated",
          description: `Transaction reference: ${paymentData?.transactionId || "INV-BKASH"}.`,
          type: "success",
        });
        onClose();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to connect to bKash gateway";
      toast.add({
        title: "bKash Gateway Error",
        description: errorMsg,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 px-2.5 rounded-lg bg-[#D12053]/10 text-[#D12053] font-black text-xs tracking-wider flex items-center justify-center font-mono">
              bKash
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Priority SLA Settlement
              </h2>
              <p className="text-xs text-muted-foreground">
                Expedited power restoration dispatch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Report Overview */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Incident Ticket:
            </span>
            <span className="font-mono text-foreground font-semibold truncate max-w-[200px]">
              {report.description || `Report #${report.id.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Sector:</span>
            <span className="text-foreground">
              {report.area?.name || "Assigned Area"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
            <span className="text-muted-foreground font-medium">
              Priority Verification Fee:
            </span>
            <span className="text-sm font-bold font-mono text-foreground">
              {formatBDT(200)}
            </span>
          </div>
        </div>

        {/* Priority SLA Benefits */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Included Priority Guarantees
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Flame className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Elevates outage priority to <strong>HIGH</strong> on the central
                dispatcher console.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Dispatches nearest on-duty rapid response crew with active phone
                contact.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Official DESCO/DPDC regulatory audit logging with SLA compliance
                tracking.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInitiatePayment}
            disabled={isProcessing}
            className="bg-[#D12053] hover:bg-[#b01b45] text-white gap-2 font-semibold shadow-xs"
          >
            <CreditCard className="h-4 w-4" />
            <span>
              {isProcessing
                ? "Processing..."
                : `Pay ${formatBDT(200)} via bKash`}
            </span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </Button>
        </div>
      </div>
    </div>
  );
}
