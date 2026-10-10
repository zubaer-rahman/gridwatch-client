import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Meta } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts an array from an API response data field, whether the backend
 * returns an array directly (data: T[]) or a paginated envelope (data: { meta, data: T[] }).
 */
export function extractDataArray<T>(payload: unknown): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

/**
 * Safely extracts pagination metadata from either the outer response or nested data envelope.
 */
export function extractMeta(payload: unknown): Meta | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  if ("meta" in payload && (payload as { meta: Meta }).meta) {
    return (payload as { meta: Meta }).meta;
  }
  return undefined;
}
