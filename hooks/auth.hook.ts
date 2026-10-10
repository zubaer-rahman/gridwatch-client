"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  googleLogin,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  verifyEmail,
} from "@/api/auth.api";
import { getCurrentUser } from "@/api/user.api";
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
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const stored = getStoredToken();
    setToken(stored);
    if (!stored) {
      setUser(null);
      setAvatar(null);
      setIsLoading(false);
      return;
    }

    const decoded = decodeJwt(stored);
    if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
      setUser(decoded);
      if (typeof window !== "undefined") {
        const userStoredAvatar =
          localStorage.getItem(`gridwatch_user_avatar_${decoded.userId}`) ||
          localStorage.getItem("gridwatch_user_avatar");
        const initialAvatar = decoded.avatar || userStoredAvatar || null;
        setAvatar(initialAvatar);
        if (initialAvatar) {
          localStorage.setItem("gridwatch_user_avatar", initialAvatar);
          if (decoded.userId) {
            localStorage.setItem(
              `gridwatch_user_avatar_${decoded.userId}`,
              initialAvatar,
            );
          }
        }
      }
    } else {
      // Token expired
      setStoredToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("gridwatch_user_avatar");
      }
      setUser(null);
      setAvatar(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    const handleStorage = (e: StorageEvent | Event) => {
      if (
        !("key" in e) ||
        (e as StorageEvent).key === "gridwatch_token" ||
        (e as StorageEvent).key === "gridwatch_user_avatar" ||
        (e as StorageEvent).key?.startsWith("gridwatch_user_avatar_")
      ) {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [checkAuth]);

  const { data: meResponse } = useQuery({
    queryKey: ["user", "me", user?.userId],
    queryFn: getCurrentUser,
    enabled: !!user?.userId && !isLoading,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (meResponse?.data?.avatar) {
      setAvatar(meResponse.data.avatar);
      if (typeof window !== "undefined") {
        localStorage.setItem("gridwatch_user_avatar", meResponse.data.avatar);
        if (user?.userId) {
          localStorage.setItem(
            `gridwatch_user_avatar_${user.userId}`,
            meResponse.data.avatar,
          );
        }
      }
    }
  }, [meResponse?.data?.avatar, user?.userId]);

  const resolvedAvatar =
    meResponse?.data?.avatar || avatar || user?.avatar || null;

  return {
    user,
    avatar: resolvedAvatar,
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
        const decoded = decodeJwt(response.data.accessToken);
        if (typeof window !== "undefined") {
          const userStoredAvatar = decoded?.userId
            ? localStorage.getItem(`gridwatch_user_avatar_${decoded.userId}`)
            : null;
          const initialAvatar = decoded?.avatar || userStoredAvatar;
          if (initialAvatar) {
            localStorage.setItem("gridwatch_user_avatar", initialAvatar);
            if (decoded?.userId) {
              localStorage.setItem(
                `gridwatch_user_avatar_${decoded.userId}`,
                initialAvatar,
              );
            }
          }
          window.dispatchEvent(new Event("storage"));
        }
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
        const decoded = decodeJwt(response.data.accessToken);
        if (typeof window !== "undefined") {
          const userStoredAvatar = decoded?.userId
            ? localStorage.getItem(`gridwatch_user_avatar_${decoded.userId}`)
            : null;
          const initialAvatar = decoded?.avatar || userStoredAvatar;
          if (initialAvatar) {
            localStorage.setItem("gridwatch_user_avatar", initialAvatar);
            if (decoded?.userId) {
              localStorage.setItem(
                `gridwatch_user_avatar_${decoded.userId}`,
                initialAvatar,
              );
            }
          }
          window.dispatchEvent(new Event("storage"));
        }
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
        const decoded = decodeJwt(response.data.accessToken);
        if (typeof window !== "undefined") {
          const userStoredAvatar = decoded?.userId
            ? localStorage.getItem(`gridwatch_user_avatar_${decoded.userId}`)
            : null;
          const initialAvatar = decoded?.avatar || userStoredAvatar;
          if (initialAvatar) {
            localStorage.setItem("gridwatch_user_avatar", initialAvatar);
            if (decoded?.userId) {
              localStorage.setItem(
                `gridwatch_user_avatar_${decoded.userId}`,
                initialAvatar,
              );
            }
          }
          window.dispatchEvent(new Event("storage"));
        }
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("gridwatch_user_avatar");
      }
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}
