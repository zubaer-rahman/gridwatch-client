import { apiClient } from "@/lib/apiClient";
import type {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
} from "@/types";

export function loginUser(
  payload: LoginPayload,
): Promise<ApiResponse<{ accessToken: string }>> {
  return apiClient<ApiResponse<{ accessToken: string }>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerUser(
  payload: RegisterPayload,
): Promise<ApiResponse<{ email: string }>> {
  return apiClient<ApiResponse<{ email: string }>>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>("/auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

export function googleLogin(payload: {
  idToken: string;
}): Promise<ApiResponse<{ accessToken: string }>> {
  return apiClient<ApiResponse<{ accessToken: string }>>("/auth/google-login", {
    method: "POST",
    body: payload,
  });
}

export function refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
  return apiClient<ApiResponse<{ accessToken: string }>>(
    "/auth/refresh-token",
    {
      method: "POST",
    },
  );
}

export function logoutUser(): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>("/auth/logout", {
    method: "POST",
  });
}
