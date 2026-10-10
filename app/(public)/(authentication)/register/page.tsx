import type { Metadata } from "next";
import { RegisterForm } from "@/components/modules/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | GridWatch",
  description:
    "Register for a customer account to file and track outage reports.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
