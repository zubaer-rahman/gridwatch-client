import { ofetch } from "ofetch";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gridwatch_token");
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("gridwatch_token", token);
    document.cookie = `gridwatch_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    localStorage.removeItem("gridwatch_token");
    document.cookie = "gridwatch_token=; path=/; max-age=0; SameSite=Lax";
  }
}

export const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
  onRequest({ options }) {
    const token = getStoredToken();
    if (token) {
      const headers = new Headers(options.headers);
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      options.headers = headers;
    }
  },
  onResponseError({ response }) {
    const errorMessage =
      response?._data?.message ||
      response?._data?.errorMessages?.[0]?.message ||
      response?.statusText ||
      "An unexpected network error occurred";

    throw new Error(errorMessage);
  },
});

export default apiClient;
