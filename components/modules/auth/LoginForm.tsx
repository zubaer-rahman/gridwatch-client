"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Zap } from "lucide-react";
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

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: googleAuth } = useGoogleLogin();

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
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
          <Zap className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sign In to GridWatch
        </h1>
        <p className="text-xs text-muted-foreground">
          Outage management and grid telemetry operations
        </p>
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
