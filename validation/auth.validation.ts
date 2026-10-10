import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  contactNumber: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  otp: z.string().trim().length(6, "OTP code must be exactly 6 digits"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
