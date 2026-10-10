"use client";

import { useForm } from "@tanstack/react-form";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useVerifyEmail } from "@/hooks/auth.hook";
import { verifyEmailSchema } from "@/validation/auth.validation";

function VerifyEmailFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const { mutate: verify, isPending } = useVerifyEmail();

  const form = useForm({
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
    validators: {
      onSubmit: verifyEmailSchema,
    },
    onSubmit: ({ value }) => {
      verify(value, {
        onSuccess: () => {
          toast.add({
            title: "Email Verified",
            description:
              "Your account has been activated. Please sign in to continue.",
            type: "success",
          });
          router.push("/login");
        },
        onError: (err) => {
          toast.add({
            title: "Verification Failed",
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
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Verify Your Email
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter the 6-digit confirmation code sent to your email address
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
                  <FieldLabel htmlFor={field.name}>Account Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
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

          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    6-Digit Security Code
                  </FieldLabel>
                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
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
          disabled={isPending}
        >
          {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Verify & Activate
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Need to change your email?{" "}
        <Link
          href="/register"
          className="font-medium text-amber-500 underline-offset-4 hover:underline"
        >
          Back to Register
        </Link>
      </div>
    </div>
  );
}

export function VerifyEmailForm() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      }
    >
      <VerifyEmailFormContent />
    </Suspense>
  );
}
