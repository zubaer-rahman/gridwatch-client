import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/modules/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email | GridWatch",
  description: "Verify your GridWatch account using the 6-digit email code.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
