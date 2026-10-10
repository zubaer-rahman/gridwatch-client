"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  googleLogin,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  verifyEmail,
} from "@/api/auth.api";
import { getStoredToken, setStoredToken } from "@/lib/apiClient";
import type { DecodedToken, Role } from "@/types";

export function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const stored = getStoredToken();
    setToken(stored);
    if (!stored) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const decoded = decodeJwt(stored);
    if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
      setUser(decoded);
    } else {
      // Token expired
      setStoredToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "gridwatch_token") {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [checkAuth]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role as Role | undefined,
    refetchUser: checkAuth,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      if (response?.data?.accessToken) {
        setStoredToken(response.data.accessToken);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (response) => {
      if (response?.data?.accessToken) {
        setStoredToken(response.data.accessToken);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (response) => {
      if (response?.data?.accessToken) {
        setStoredToken(response.data.accessToken);
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      setStoredToken(null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}
