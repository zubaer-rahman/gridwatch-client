"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Radio, ShieldAlert, User, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { decodeJwt, useGoogleLogin, useLogin } from "@/hooks/auth.hook";
import { loginSchema } from "@/validation/auth.validation";

const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    label: "Admin",
    subtext: "System Root & RBAC",
    email: "admin@gridwatch.com",
    password: "Admin1234!",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    icon: ShieldAlert,
  },
  {
    role: "OPERATOR",
    label: "Operator",
    subtext: "Dispatch & Telemetry",
    email: "sarkar.sumon.fiverr@gmail.com",
    password: "Admin1234!",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Radio,
  },
  {
    role: "CUSTOMER",
    label: "Customer",
    subtext: "Reports & bKash SLA",
    email: "jane.doe@gridwatch.com",
    password: "Admin1234!",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: User,
  },
] as const;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const router = useRouter();

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: googleAuth } = useGoogleLogin();

  const handleOneClickLogin = (demo: (typeof DEMO_ACCOUNTS)[number]) => {
    setActiveDemoRole(demo.role);

    // Directly authenticate in the background without populating or revealing credentials in input fields
    login(
      { email: demo.email, password: demo.password },
      {
        onSuccess: (res) => {
          toast.add({
            title: `Instant Access: ${demo.label}`,
            description: "Role authentication granted.",
            type: "success",
          });

          const decoded = decodeJwt(res.data.accessToken);
          if (decoded?.role === "ADMIN") {
            router.push("/admin");
          } else if (decoded?.role === "OPERATOR") {
            router.push("/operator");
          } else {
            router.push("/customer");
          }
        },
        onError: (err) => {
          setActiveDemoRole(null);
          toast.add({
            title: "Demo Authorization Failure",
            description: err.message,
            type: "error",
          });
        },
      },
    );
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: (res) => {
          toast.add({
            title: "Authentication Successful",
            description: "Welcome to GridWatch Operations.",
            type: "success",
          });

          const decoded = decodeJwt(res.data.accessToken);
          if (decoded?.role === "ADMIN") {
            router.push("/admin");
          } else if (decoded?.role === "OPERATOR") {
            router.push("/operator");
          } else {
            router.push("/customer");
          }
        },
        onError: (err) => {
          toast.add({
            title: "Authorization Failure",
            description: err.message,
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div suppressHydrationWarning className="w-full space-y-6">
      <div suppressHydrationWarning className="space-y-2 text-center">
        <div
          suppressHydrationWarning
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
        >
          <Zap className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sign In to GridWatch
        </h1>
        <p className="text-xs text-muted-foreground">
          Outage management and grid telemetry operations
        </p>
      </div>

      {/* One-Click Role Login Panel without credential exposure */}
      <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            One-Click Demo Access
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/80">
            Instant Secure Sign-In
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((demo) => {
            const Icon = demo.icon;
            const isTargetPending =
              activeDemoRole === demo.role && isLoginPending;

            return (
              <button
                key={demo.role}
                type="button"
                disabled={isLoginPending}
                onClick={() => handleOneClickLogin(demo)}
                className={`group text-left p-2.5 rounded-lg border transition-all hover:border-amber-500/40 hover:bg-muted/40 disabled:opacity-60 cursor-pointer ${
                  activeDemoRole === demo.role
                    ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${demo.badgeClass}`}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {demo.label}
                  </span>
                  {isTargetPending && (
                    <Spinner className="h-3 w-3 text-amber-500" />
                  )}
                </div>
                <p className="text-[11px] font-medium text-foreground truncate">
                  {demo.label} Portal
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {demo.subtext}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground text-[10px] tracking-wider">
            Or Standard Credentials
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="operator@gridwatch.bd"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="email"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  </div>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <Button
          type="submit"
          className="w-full bg-amber-500 font-medium text-black hover:bg-amber-400"
          disabled={isLoginPending}
        >
          {isLoginPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              googleAuth(
                { idToken: credentialResponse.credential },
                {
                  onSuccess: (res) => {
                    toast.add({
                      title: "Google Authentication Successful",
                      description: "Welcome to GridWatch.",
                      type: "success",
                    });
                    const decoded = decodeJwt(res.data.accessToken);
                    if (decoded?.role === "ADMIN") {
                      router.push("/admin");
                    } else if (decoded?.role === "OPERATOR") {
                      router.push("/operator");
                    } else {
                      router.push("/customer");
                    }
                  },
                  onError: (err) => {
                    toast.add({
                      title: "Google Login Failed",
                      description: err.message,
                      type: "error",
                    });
                  },
                },
              );
            }
          }}
          onError={() => {
            toast.add({
              title: "Google Sign-In Error",
              description: "Could not initialize Google authentication popup.",
              type: "error",
            });
          }}
        />
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Do not have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-amber-500 underline-offset-4 hover:underline"
        >
          Create Customer Account
        </Link>
      </div>
    </div>
  );
}
