import type { Metadata } from "next";
import { LoginForm } from "@/components/modules/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | GridWatch Operations",
  description: "Sign in to access your GridWatch operator or customer portal.",
};

export default function LoginPage() {
  return <LoginForm />;
}
