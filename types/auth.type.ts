import type { Role } from "./user.type";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  contactNumber: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: Role;
  name?: string;
  avatar?: string | null;
}
